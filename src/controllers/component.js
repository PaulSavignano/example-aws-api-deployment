import { ObjectID } from 'mongodb'

import { deleteFiles, uploadFile } from '../utils/s3'
import Component from '../models/Component'
import getTime from '../utils/getTime'
import handleItemImages from '../utils/handleItemImages'
import Section from '../models/Section'



export const add = async (req, res) => {
  const {
    body: {
      kind,
      pageId,
      pageSlug,
      sectionId,
      values,
    },
    appName
  } = req
  const _id = new ObjectID()
  const backgroundImage = values.backgroundImage && values.backgroundImage.src && values.backgroundImage.src.includes('data') ? {
    backgroundImage: {
      ...values.backgroundImage,
      src: await uploadFile({
        Key: `${appName}/page-${pageSlug}/component-${_id}-${kind}-background-image_${getTime()}.${values.backgroundImage.ext}`,
        Body: new Buffer(values.backgroundImage.src.replace(/^data:image\/\w+;base64,/, ""),'base64'),
      })
    }
  } : {}
  // handle items array and check for images that have a data prefix
  const items = values.items && {
    items: await handleItemImages({
      _id,
      appName,
      items: values.items,
      kind,
      pageSlug,
    })
  }

  const newValues = {
    ...values,
    ...backgroundImage,
    ...items,
  }

  const component = await new Component({
    _id,
    appName,
    page: new ObjectID(pageId),
    pageSlug,
    section: new ObjectID(sectionId),
    kind,
    values: newValues,
  }).save()
  if (!component) throw Error('Component add failed')

  const section = await Section.findOneAndUpdate(
    { _id: component.section, appName },
    { $push: { components: component._id }},
    { new: true }
  )
  if (!section) throw Error('Section push component failed')

  return res.send({ component, section })
}






export const get = async (req, res) => {
  const { appName } = req
  const components = await Component.find({ appName })
  return res.send(components)
}






export const updateValues = async (req, res) => {
  const {
    body: {
      kind,
      oldSrcs,
      pageSlug,
      values,
    },
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Component update failed, invalid _id')
  // delete old image files as we cannot determine if there is one to delete if an image has been removed from the items array
  oldSrcs.length && await deleteFiles(oldSrcs)

  // handle new background image
  const backgroundImage = values.backgroundImage && values.backgroundImage.src && values.backgroundImage.src.includes('data') ? {
    backgroundImage: {
      ...values.backgroundImage,
      src: await uploadFile({
        Key: `${appName}/page-${pageSlug}/component-${_id}-${kind}-background-image_${getTime()}.${values.backgroundImage.ext}`,
        Body: new Buffer(values.backgroundImage.src.replace(/^data:image\/\w+;base64,/, ""),'base64'),
      })
    }
  } : {}

  // handle items array, check for images that have a data prefix
  const items = values.items && {
    items: await handleItemImages({
      _id,
      appName,
      items: values.items,
      kind,
      pageSlug,
    })
  }

  const newValues = {
    ...values,
    ...backgroundImage,
    ...items,
  }

  const component = await Component.findOneAndUpdate(
    { _id, appName },
    { $set: {
      values: newValues
    }},
    { new: true }
  )
  if (!component) throw Error('Component update failed')

  return res.send(component)
}








export const updateItemOrder = async (req, res) => {
  const {
    body: { items },
    appName,
    params: { _id }
  } = req
  console.log('items!', items)
  const component = await Component.findOneAndUpdate(
    { _id, appName },
    { $set: { 'values.items': items }},
    { new: true }
  )
  console.log('component', component.values.items)
  if (!component) throw Error('Component item order update error')
  return res.send(component)
}











export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Component remove failed, invalid _id')
  const component = await Component.findOne({ _id, appName })
  if (!component) throw Error('Component remove error, no component found')
  await component.remove()
  const section = await Section.findOneAndUpdate(
    { _id: component.section, appName },
    { $pull: { components: component._id }},
    { new: true }
  )
  if (!section) throw Error('Section pull component failed')
  return res.send({ _id: component._id, section })
}
