import { ObjectID } from 'mongodb'

import { deleteFiles } from '../utils/s3'
import getTime from '../utils/getTime'
import AppPages from '../models/AppPages'
import CustomError from '../utils/CustomError'
import handleImage from '../utils/handleImage'
import Page from '../models/Page'
import getSlug from '../utils/getSlug'



export const add = async (req, res) => {
  const {
    body: { values },
    appName
  } = req
  const existingPage = await Page.findOne({ 'values.name': values.name, appName })
  if (existingPage) throw new CustomError({ field: 'name', message: 'That name already exists', statusCode: 400 })
  const page = await new Page({
    appName,
    slug: getSlug(values.name),
    values
  }).save()
  if (!page) throw Error('Page add failed')
  const appPages = await AppPages.findOneAndUpdate(
    { appName },
    { $push: { pages: page._id }},
    { new: true }
  )
  if (!appPages) throw Error('AppPages push page failed')
  return res.send({ page, pageIds: appPages.pages })
}






export const get = async (req, res) => {
  const { appName } = req
  const pages = await Page.find({ appName })
  const appPages = await AppPages.findOne({ appName })
  return res.send({ pages, pageIds: appPages.pages })
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
  if (!ObjectID.isValid(_id)) throw Error('Page update failed, invalid id')
  oldSrcs.length && await deleteFiles(oldSrcs)

  const valuesUpdate = values && values.backgroundImage && values.backgroundImage.src && values.backgroundImage.src.indexOf('data') !== -1 ? {
    ...values,
    backgroundImage: await handleImage({
      path: `${appName}/${pageSlug}/background-image-${_id}_${getTime()}.${values.backgroundImage.ext}`,
      image: values.backgroundImage,
    })
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
      slug: getSlug(values.name),
      'values.name': values.name
    }},
    { new: true }
  )
  return res.send(page)
}






export const updatePageIdsOrder = async (req, res) => {
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






export const updateValue = async (req, res) => {
  const {
    body: { key, value },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Page update failed, invalid id')

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
  if (!ObjectID.isValid(_id)) throw Error('Page remove failed, invalid id')
  const page = await Page.findOne({ _id, appName })
  if (!page) throw Error('Page delete failed, no page found')
  await page.remove()
  const appPages = await AppPages.findOneAndUpdate(
    { appName },
    { $pull: { pages: page._id }},
    { new: true }
  )
  if (!appPages) throw Error('AppPages pull page failed')
  return res.send({ _id: page._id, pageIds: appPages.pages })
}
