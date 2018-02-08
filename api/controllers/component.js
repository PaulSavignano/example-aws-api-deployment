import { ObjectID } from 'mongodb'

import Component from '../models/Component'
import Section from '../models/Section'
import Page from '../models/Page'
import { deleteFiles } from '../utils/s3'
import handleImage from '../utils/handleImage'
import handleItemImages from '../utils/handleItemImages'
import formatDate from '../utils/formatDate'

export const add = async (req, res) => {
  const {
    body: {
      kind,
      pageId,
      pageSlug,
      sectionId,
      values,
    },
    params: { brandName }
  } = req
  const _id = new ObjectID()


  const backgroundImage = values.backgroundImage && values.backgroundImage.src && values.backgroundImage.src.indexOf('data') !== -1 ? {
    backgroundImage: await handleImage({
      path: `${brandName}/${pageSlug}/component-${kind}-background-image-${_id}_${formatDate(new Date())}.${values.backgroundImage.ext}`,
      image: values.backgroundImage,
    })
  } : {}
  // handle items array and check for images that have a data prefix
  const items = values.items && {
    items: await handleItemImages({
      _id,
      brandName,
      items: values.items,
      kind,
      pageSlug,
      imageType: 'image',
    })
  }

  const newValues = {
    ...values,
    ...backgroundImage,
    ...items,
  }

  const component = await new Component({
    _id,
    brandName,
    page: new ObjectID(pageId),
    pageSlug,
    section: new ObjectID(sectionId),
    kind,
    values: newValues,
  }).save()
  if (!component) throw Error('Component add failed')

  const section = await Section.findOneAndUpdate(
    { _id: component.section, brandName },
    { $push: { components: component._id }},
    { new: true }
  )
  if (!section) throw Error('Component add to Section failed')

  return res.send(component)
}





// Read
export const get = async (req, res) => {
  console.log('made it to controller')
  const { brandName } = req.params
  console.log('looking up brandName', brandName)
  const components = await Component.find({ brandName })
  return res.send(components)
}





export const update = async (req, res) => {
  const {
    body: {
      kind,
      oldSrcs,
      pageSlug,
      values,
    },
    params: { _id, brandName },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Component update failed, invalid id')
  // delete old image files as we cannot determine if there is one to delete if an image has been removed from the items array
  const imageDeletes = oldSrcs.length && await deleteFiles(oldSrcs)

  // handle new background image
  const backgroundImage = values.backgroundImage && values.backgroundImage.src && values.backgroundImage.src.indexOf('data') !== -1 ? {
    backgroundImage: await handleImage({
      path: `${brandName}/${pageSlug}/component-${kind}-background-image-${_id}_${formatDate(new Date())}.${values.backgroundImage.ext}`,
      image: values.backgroundImage,
    })
  } : {}

  // handle items array, check for images that have a data prefix
  const items = values.items && {
    items: await handleItemImages({
      _id,
      brandName,
      items: values.items,
      kind,
      pageSlug,
      imageType: 'image',
    })
  }

  const newValues = {
    ...values,
    ...backgroundImage,
    ...items,
  }

  const component = await Component.findOneAndUpdate(
    { _id, brandName },
    { $set: {
      values: newValues
    }},
    { new: true }
  )
  if (!component) throw Error('Component update failed')

  return res.send(component)
}





export const remove = async (req, res) => {
  const {
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Component remove failed, invalid id')
  const component = await Component.findOne({ _id, brandName })
  await component.remove()
  if (!component) throw 'Component remove Component.findOneAndRemove() error'
  const section = await Section.findOneAndUpdate(
    { _id: component.section, brandName },
    { $pull: { components: component._id }},
    { new: true }
  )
  if (!section) throw Error('Component remove Section failed')
  return res.send(component._id)
}
