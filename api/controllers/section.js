import { ObjectID } from 'mongodb'

import { deleteFiles, uploadFile } from '../utils/s3'
import handleImage from '../utils/handleImage'
import formatDate from '../utils/formatDate'
import Page from '../models/Page'
import Section from '../models/Section'


export const add = async (req, res) => {
  const {
    body: { pageId, pageSlug, values },
    params: { brandName }
  } = req
  const newImageValues = values.backgroundImage && values.backgroundImage.src && values.backgroundImage.src.indexOf('data') !== -1 ? {
    ...values,
    backgroundImage: await handleImage({
      path: `${brandName}/${pageSlug}/section-${_id}-background-image-_${formatDate(new Date())}.${values.backgroundImage.ext}`,
      image: values.backgroundImage,
    })
  } : null

  const newValues = newImageValues ? newImageValues : values

  const section = await new Section({
    brandName,
    page: ObjectID(pageId),
    pageSlug,
    values: newValues
  }).save()
  if (!section) throw Error('Section add failed')

  const page = await Page.findOneAndUpdate(
    { _id: section.page, brandName },
    { $push: { sections: section._id }},
    { new: true }
  )
  if (!page) throw Error('Section add to page failed')

  return res.send(section)
}





export const get = async (req, res) => {
  const { brandName } = req.params
  const sections = await Section.find({ brandName })
  return res.send(sections)
}





export const update = async (req, res) => {
  const {
    body: {
      kind,
      oldSrcs,
      pageSlug,
      values,
    },
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Section update failed, invalid id')
  oldSrcs.length && await deleteFiles(oldSrcs)

  // handle new background image
  const newImageValues = values.backgroundImage && values.backgroundImage.src && values.backgroundImage.src.indexOf('data') !== -1 ? {
    ...values,
    backgroundImage: await handleImage({
      path: `${brandName}/${pageSlug}/section-${_id}-background-image-_${formatDate(new Date())}.${values.backgroundImage.ext}`,
      image: values.backgroundImage,
    })
  } : null

  const newValues = newImageValues ? newImageValues : values

  const section = await Section.findOneAndUpdate(
    { _id, brandName },
    { $set: {
      values: newValues,
    }},
    { new: true }
  ).populate({ path: 'items.item' })

  if (!section) throw Error('Section updated failed')
  return res.send(section)
}






export const remove = async (req, res) => {
  const {
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Section remove failed, invalid id')
  const section = await Section.findOne({ _id, brandName })
  await section.remove()
  if (!section) throw 'Section remove failed'
  const page = await Page.findOneAndUpdate(
    { _id: section.page, brandName },
    { $pull: { sections: section._id }},
    { new: true }
  )
  if (!page) throw Error('Section remove from Page failed')
  return res.send(section._id)
}
