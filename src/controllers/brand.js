import { ObjectID } from 'mongodb'

import { getTime } from '../utils/formatDate'
import { uploadFile, deleteFiles } from '../utils/s3'
import Config from '../models/Config'
import Blog from '../models/Blog'
import Product from '../models/Product'
import Brand from '../models/Brand'
import handleImage from '../utils/handleImage'
import Page from '../models/Page'
import Theme from '../models/Theme'


export const add = async (req, res) => {
  const { appName } = req
  const config = await new Config({ appName }).save()
  const page = await new Page({ appName, 'values.name': 'Home', slug: 'home' }).save()
  const brand = await new Brand({ appName, pages: page._id }).save()
  const theme = await new Theme({ appName }).save()
  return res.send({
    brand,
    page,
    theme,
  })
}


export const get = async (req, res) => {
  const { appName } = req
  const brand = await Brand.findOne({ appName })
  if (!brand) throw 'No brand found'
  res.send(brand)
}



// Update brand
export const update = async (req, res) => {
  const {
    body: { brandParam, oldImageSrc, values },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Brand update failed, Invalid id')
  oldImageSrc && await deleteFiles([{ Key: oldImageSrc }])

  const valuesWithNewImage = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${appName}/${brandParam}-image_${getTime()}.${values.image.ext}`,
      image: values.image,
    })
  } : null
  const newValues = valuesWithNewImage ? valuesWithNewImage : values

  if (brandParam) {
    const brand = await Brand.findOneAndUpdate(
      { _id, appName },
      { $set: {
        [brandParam]: newValues
      }},
      { new: true }
    )
    if (!brand) throw Error('Brand update failed')
    return res.send(brand)
  } else {
    throw Error('Brand update failed, Invalid params')
  }
}






export const updatePages = async (req, res) => {
  const {
    body: { pageIds },
    appName,
    params: { _id }
  } = req
  const brand = await Brand.findOneAndUpdate(
    { _id, appName },
    { $set: { pages: pageIds }},
    { new: true }
  )
  if (!brand) throw Error('Brand set pages failed')
  return res.send(brand)
}







// Delete
export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Brand remove failed, Invalid id')
  const brand = await Brand.findOne({ _id, appName })
  await brand.remove()
  if (!brand) throw 'Brand remove Brand.findOneAndRemove() error'
  return res.send(brand._id)
}
