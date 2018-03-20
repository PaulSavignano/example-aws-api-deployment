import { ObjectID } from 'mongodb'
import url from 'url'

import { deleteFiles, uploadFile } from '../utils/s3'
import { getTime } from '../utils/formatDate'
import Brand from '../models/Brand'
import CustomError from '../utils/CustomError'
import handleImage from '../utils/handleImage'
import Page from '../models/Page'
import slugIt from '../utils/slugIt'


export const add = async (req, res) => {
  const {
    body: { values },
    appName
  } = req
  const existingPage = await Page.findOne({ 'values.name': values.name, appName })
  if (existingPage) throw new CustomError({ field: 'name', message: 'That name already exists', statusCode: 400 })
  const page = await new Page({
    appName,
    slug: slugIt(values.name),
    values
  }).save()
  if (!page) throw Error('Page add failed')
  const brand = await Brand.findOneAndUpdate(
    { appName },
    { $push: { pages: page._id }},
    { new: true }
  )
  if (!brand) throw Error('Brand push page failed')
  return res.send({ brand, page })
}



export const get = async (req, res) => {
  const { appName } = req
  const pages = await Page.find({ appName })
  return res.send(pages)
}



export const update = async (req, res) => {
  const {
    body: {
      oldSrcs,
      kind,
      values,
      pageSlug,
    },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Page update failed, invalid id')
  oldSrcs.length && await deleteFiles(oldSrcs)

  const newImageValues = values.backgroundImage && values.backgroundImage.src && values.backgroundImage.src.indexOf('data') !== -1 ? {
    ...values,
    backgroundImage: await handleImage({
      path: `${appName}/${pageSlug}/background-image-${_id}_${formatDate()}.${values.backgroundImage.ext}`,
      image: values.backgroundImage,
    })
  } : null
  const newValues = newImageValues ? newImageValues : values

  const page = await Page.findOneAndUpdate(
    { _id, appName },
    { $set: {
      values: newValues,
    }},
    { new: true }
  )
  return res.send(page)
}



export const updateValues = async (req, res) => {
  const {
    body: { key, value },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Page update failed, invalid id')

  const set = { $set: {}}
  set.$set["values." + key] = value
  const page = await Page.findOneAndUpdate(
    { _id, appName },
    set,
    { new: true }
  )
  return res.send(page)
}




export const updateSections = async (req, res) => {
  const {
    body: { sectionIds },
    appName,
    params: { _id }
  } = req
  const page = await Page.findOneAndUpdate(
    { _id, appName },
    { $set: { sections: sectionIds }},
    { new: true }
  )
  if (!page) throw Error('Page set sections failed')
  return res.send(page)
}



export const updateName = async (req, res) => {
  const {
    body: { values },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Page update failed, invalid id')
  const existingPage = await Page.findOne({ appName, 'values.name': values.name })
  if (existingPage) throw new CustomError({ field: 'name', message: 'That name already exists', statusCode: 406 })
  const page = await Page.findOneAndUpdate(
    { _id, appName },
    { $set: {
      slug,
      'values.name': values.name
    }},
    { new: true }
  )
  return res.send(page)
}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Page remove failed, invalid id')
  const page = await Page.findOne({ _id, appName })
  if (!page) throw Error('Page delete failed, no page found')
  await page.remove()
  const brand = await Brand.findOneAndUpdate(
    { appName },
    { $pull: { pages: page._id }},
    { new: true }
  )
  if (!brand) throw Error('Brand pull page failed')
  return res.send({ brand, _id: page._id })
}
