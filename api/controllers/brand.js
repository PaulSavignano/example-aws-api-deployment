import express from 'express'
import { ObjectID } from 'mongodb'
import url from 'url'
import formatDate from '../utils/formatDate'

import ApiConfig from '../models/ApiConfig'
import Brand from '../models/Brand'
import Page from '../models/Page'
import { uploadFile, deleteFiles } from '../utils/s3'
import handleImage from '../utils/handleImage'
import handleItemImages from '../utils/handleItemImages'


export const add = async (req, res) => {
  const { brandName } = req.params
  const apiConfig = await new ApiConfig({ brandName }).save()
  const brand = await new Brand({ brandName }).save()
  const page = await new Page({ brandName, 'values.name': 'Home', slug: 'home' }).save()
  res.send({ apiConfig, brand, page })
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
      path: `${brandName}/${brandParam}-image_${formatDate(new Date())}.${values.image.ext}`,
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




// Update theme
export const updateTheme = async (req, res) => {
  const {
    body: {
      oldImageSrc,
      themeItem,
      themeItemChild,
      values,
    },
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Theme update failed, Invalid id')
  oldImageSrc && await deleteFiles([{ Key: oldImageSrc }])

  const valuesWithNewImage = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${brandName}/${themeItem}-image_${formatDate(new Date())}.${values.image.ext}`,
      image: values.image,
    })
  } : null
  const newValues = valuesWithNewImage ? valuesWithNewImage : values

  if (themeItem) {
    if (themeItemChild === 'general') {
      const {
        fontFamily,
        fontSize,
        fontWeightLight,
        fontWeightMedium,
        fontWeightRegular,
      } = values
      const brand = await Brand.findOneAndUpdate(
        { _id, brandName },
        { $set: {
          'theme.typography.fontFamily': fontFamily,
          'theme.typography.fontSize': fontSize,
          'theme.typography.fontWeightLight': fontWeightLight,
          'theme.typography.fontWeightMedium': fontWeightMedium,
          'theme.typography.fontWeightRegular': fontWeightRegular,
          }
        },
        { new: true }
      )
      if (!brand) throw Error(`Brand update of ${themeItem}`)
      return res.send(brand)
    } else if (themeItemChild)  {
      const set = { $set: {}}
      set.$set["theme." + themeItem + "." + themeItemChild] = newValues
      const brand = await Brand.findOneAndUpdate({ _id, brandName }, set,{ new: true })
      if (!brand) throw Error(`Brand update ${themeItem} ${themeItemChild} failed`)
      return res.send(brand)
    } else {
      const set = { $set: {}}
      set.$set["theme." + themeItem] = newValues
      const brand = await Brand.findOneAndUpdate({ _id, brandName }, set, { new: true })
      if (!brand) throw Error(`Brand update ${themeItem} ${themeItemChild} failed`)
      return res.send(brand)
    }
  } else {
    throw Error('Brand update failed, invalid params')
  }
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
