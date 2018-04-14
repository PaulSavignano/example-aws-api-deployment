import { ObjectID } from 'mongodb'

import { deleteFiles } from '../utils/s3'
import getTime from '../utils/getTime'
import handleImage from '../utils/handleImage'
import Page from '../models/Page'
import Section from '../models/Section'



export const add = async (req, res) => {
  const {
    body: { pageId, pageSlug, values },
    appName,
  } = req
  const _id = new ObjectID()

  const newImageValues = values.backgroundImage && values.backgroundImage.src && values.backgroundImage.src.indexOf('data') !== -1 ? {
    ...values,
    backgroundImage: await handleImage({
      path: `${appName}/${pageSlug}/section-${_id}-background-image-_${getTime()}.${values.backgroundImage.ext}`,
      image: values.backgroundImage,
    })
  } : null

  const newValues = newImageValues ? newImageValues : values

  const section = await new Section({
    _id,
    appName,
    page: ObjectID(pageId),
    pageSlug,
    values: newValues
  }).save()
  if (!section) throw Error('Section add failed')

  const page = await Page.findOneAndUpdate(
    { _id: section.page, appName },
    { $push: { sections: section._id }},
    { new: true }
  )
  if (!page) throw Error('Page push section failed')

  return res.send({ section, page })
}






export const get = async (req, res) => {
  const { appName } = req
  const sections = await Section.find({ appName })
  return res.send(sections)
}






export const update = async (req, res) => {
  const {
    body: {
      oldSrcs,
      pageSlug,
      values,
    },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Section update failed, invalid _id')
  oldSrcs.length && await deleteFiles(oldSrcs)

  // handle new background image
  const newImageValues = values.backgroundImage && values.backgroundImage.src && values.backgroundImage.src.indexOf('data') !== -1 ? {
    ...values,
    backgroundImage: await handleImage({
      path: `${appName}/${pageSlug}/section-${_id}-background-image-_${getTime()}.${values.backgroundImage.ext}`,
      image: values.backgroundImage,
    })
  } : null

  const newValues = newImageValues ? newImageValues : values

  const section = await Section.findOneAndUpdate(
    { _id, appName },
    { $set: {
      values: newValues,
    }},
    { new: true }
  ).populate({ path: 'items.item' })

  if (!section) throw Error('Section updated failed')
  return res.send(section)
}






export const updateComponents = async (req, res) => {
  const {
    body: { componentIds },
    appName,
    params: { _id }
  } = req
  const section = await Section.findOneAndUpdate(
    { _id, appName },
    { $set: { components: componentIds }},
    { new: true }
  )
  if (!section) throw Error('Section set components failed')
  return res.send(section)
}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Section remove failed, invalid _id')
  const section = await Section.findOne({ _id, appName })
  if (!section) throw Error('Section delete failed, no section found')
  await section.remove()
  const page = await Page.findOneAndUpdate(
    { _id: section.page, appName },
    { $pull: { sections: section._id }},
    { new: true }
  )
  if (!page) throw Error('Page pull section failed')
  return res.send({ page, _id: section._id })
}
