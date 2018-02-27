import express from 'express'
import { ObjectID } from 'mongodb'
import formatDate from '../utils/formatDate'

import Theme from '../models/Theme'
import { uploadFile, deleteFiles } from '../utils/s3'
import handleImage from '../utils/handleImage'
import handleItemImages from '../utils/handleItemImages'


export const add = async (req, res) => {
  const { brandName } = req.params
  const theme = await new Theme({ brandName }).save()
  res.send(theme)
}


export const get = async (req, res) => {
  const { brandName } = req.params
  const theme = await Theme.find({ brandName })
  if (!theme) throw 'No theme found'
  return res.send(theme)
}




// Update theme
export const update = async (req, res) => {
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

  if (themeItem === 'general') {
    const {
      fontFamily,
      fontSize,
      fontWeightLight,
      fontWeightMedium,
      fontWeightRegular,
    } = values
    const theme = await Theme.findOneAndUpdate(
      { _id, brandName },
      { $set: {
        'typography.fontFamily': fontFamily,
        'typography.fontSize': fontSize,
        'typography.fontWeightLight': fontWeightLight,
        'typography.fontWeightMedium': fontWeightMedium,
        'typography.fontWeightRegular': fontWeightRegular,
        }
      },
      { new: true }
    )
    if (!theme) throw Error(`Theme update of ${themeItem}`)
    return res.send(theme)
  } else if (themeItemChild)  {
    const set = { $set: {}}
    set.$set[themeItem + "." + themeItemChild] = newValues
    const theme = await Theme.findOneAndUpdate({ _id, brandName }, set,{ new: true })
    if (!theme) throw Error(`Theme update ${themeItem} ${themeItemChild} failed`)
    return res.send(theme)
  } else {
    const set = { $set: {}}
    set.$set[themeItem] = newValues
    const theme = await Theme.findOneAndUpdate({ _id, brandName }, set, { new: true })
    if (!theme) throw Error(`Theme update ${themeItem} failed`)
    return res.send(theme)
  }
}






// Delete
export const remove = async (req, res) => {
  const { _id, brandName } = req.params
  if (!ObjectID.isValid(_id)) throw Error('Theme remove failed, Invalid id')
  const theme = await Theme.findOne({ _id, brandName })
  await theme.remove()
  if (!theme) throw 'Theme remove Theme.findOneAndRemove() error'
  return res.send(theme._id)
}
