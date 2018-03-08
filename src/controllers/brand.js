import { ObjectID } from 'mongodb'

import { getTime } from '../utils/formatDate'
import { uploadFile, deleteFiles } from '../utils/s3'
import Config from '../models/Config'
import Brand from '../models/Brand'
import handleImage from '../utils/handleImage'
import Page from '../models/Page'
import Theme from '../models/Theme'


export const add = async (req, res) => {
  const { brandName } = req.params
  const config = await new Config({ brandName }).save()
  const page = await new Page({ brandName, 'values.name': 'Home', slug: 'home' }).save()
  const brand = await new Brand({ brandName, pages: page._id }).save()
  const theme = await new Theme({ brandName }).save()
  return res.send({
    brand,
    page,
    theme,
  })
}


export const get = async (req, res) => {
  const { brandName } = req.params
  const brand = await Brand.find({ brandName })
  if (!brand) throw 'No brand found'
  res.send(brand)
}



// Update brand
export const update = async (req, res) => {
  const {
    body: {
      brandParam,
      oldImageSrc,
      values,
    },
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Brand update failed, Invalid id')
  oldImageSrc && await deleteFiles([{ Key: oldImageSrc }])

  const valuesWithNewImage = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${brandName}/${brandParam}-image_${getTime()}.${values.image.ext}`,
      image: values.image,
    })
  } : null
  const newValues = valuesWithNewImage ? valuesWithNewImage : values

  if (brandParam) {
    const brand = await Brand.findOneAndUpdate(
      { _id, brandName },
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
    params: { _id, brandName }
  } = req
  console.log('req body', req.body)
  console.log('_id', _id, 'brandName', brandName)
  const brand = await Brand.findOneAndUpdate(
    { _id, brandName },
    { $set: { pages: pageIds }},
    { new: true }
  )
  if (!brand) throw Error('Brand set pages failed')
  return res.send(brand)
}







// Delete
export const remove = async (req, res) => {
  const { _id, brandName } = req.params
  if (!ObjectID.isValid(_id)) throw Error('Brand remove failed, Invalid id')
  const brand = await Brand.findOne({ _id, brandName })
  await brand.remove()
  if (!brand) throw 'Brand remove Brand.findOneAndRemove() error'
  return res.send(brand._id)
}
