import { ObjectID } from 'mongodb'

import { deleteFiles, uploadFile } from '../utils/s3'
import getTime from '../utils/getTime'
import AppPages from '../models/AppPages'
import CustomError from '../utils/CustomError'
import Page from '../models/Page'
import getSlug from '../utils/getSlug'



export const add = async (req, res) => {
  const {
    body: { values },
    appName
  } = req
  const existingPage = await Page.findOne({ name: values.name, appName })
  if (existingPage) throw new CustomError({ field: 'name', message: 'That name already exists', statusCode: 400 })
  const slug = getSlug(values.name)
  const page = await new Page({
    appName,
    name: values.name,
    slug,
    'values.description': `Page ${values.name}`
  }).save()
  if (!page) throw Error('Page add failed')
  const appPages = await AppPages.findOneAndUpdate(
    { appName },
    { $push: { pages: page._id }},
    { new: true }
  )
  if (!appPages) throw Error('AppPages push page failed')
  return res.send({ page, appPages })
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
      values,
      pageSlug,
    },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Page update failed, invalid _id')
  oldSrcs.length && await deleteFiles(oldSrcs)

  const valuesUpdate = values.backgroundImage && values.backgroundImage.src && values.backgroundImage.src.includes('data') ? {
    ...values,
    backgroundImage: {
      ...values.backgroundImage,
      src: await uploadFile({
        Key: `${appName}/page-${pageSlug}/page-${_id}-background-image_${getTime()}.${values.backgroundImage.ext}`,
        Body: new Buffer(values.backgroundImage.src.replace(/^data:image\/\w+;base64,/, ""),'base64'),
      })
    }
  } : values

  const page = await Page.findOneAndUpdate(
    { _id, appName },
    { $set: {
      values: valuesUpdate,
    }},
    { new: true }
  )
  return res.send(page)
}






export const updateName = async (req, res) => {
  const {
    body: { value },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Page update failed, invalid _id')
  const existingPage = await Page.findOne({ appName, name: value })
  if (existingPage) throw new CustomError({ field: 'name', message: 'That name already exists', statusCode: 406 })
  const page = await Page.findOneAndUpdate(
    { _id, appName },
    { $set: {
      slug: getSlug(value),
      name: value
    }},
    { new: true }
  )
  return res.send(page)
}






export const updateOrder = async (req, res) => {
  const {
    body: { pageIds },
    appName,
    params: { _id }
  } = req
  const appPages = await AppPages.findOneAndUpdate(
    { _id, appName },
    { $set: { pages: pageIds }},
    { new: true }
  )
  if (!appPages) throw Error('Brand set pages failed')
  return res.send(appPages.pages)
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




export const updateKey = async (req, res) => {
  const {
    body: { key, value },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Page update failed, invalid _id')

  const set = { $set: {}}
  set.$set[key] = value
  const page = await Page.findOneAndUpdate(
    { _id, appName },
    set,
    { new: true }
  )
  return res.send(page)
}





export const updateValue = async (req, res) => {
  const {
    body: { key, value },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Page update failed, invalid _id')

  const set = { $set: {}}
  set.$set[`values.${key}`] = value
  const page = await Page.findOneAndUpdate(
    { _id, appName },
    set,
    { new: true }
  )
  return res.send(page)
}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Page remove failed, invalid _id')
  const page = await Page.findOne({ _id, appName })
  if (!page) throw Error('Page delete failed, no page found')
  await page.remove()
  const appPages = await AppPages.findOneAndUpdate(
    { appName },
    { $pull: { pages: page._id }},
    { new: true }
  )
  if (!appPages) throw Error('AppPages pull page failed')
  return res.send({ _id: page._id, appPages })
}
