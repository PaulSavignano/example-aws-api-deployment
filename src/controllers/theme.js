import { ObjectID } from 'mongodb'

import { getTime } from '../utils/formatDate'
import { deleteFiles } from '../utils/s3'
import handleImage from '../utils/handleImage'
import Theme from '../models/Theme'


export const add = async (req, res) => {
  const { appName } = req
  const theme = await new Theme({ appName }).save()
  res.send(theme)
}




export const get = async (req, res) => {
  const { appName } = req
  const theme = await Theme.findOne({ appName })
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
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Theme update failed, Invalid id')
  oldImageSrc && await deleteFiles([{ Key: oldImageSrc }])

  const valuesWithNewImage = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${appName}/${themeItem}-image_${getTime()}.${values.image.ext}`,
      image: values.image,
    })
  } : null
  const newValues = valuesWithNewImage ? valuesWithNewImage : values

  if (themeItemChild === 'general') {
    const {
      fontFamily,
      fontSize,
      fontWeightLight,
      fontWeightMedium,
      fontWeightRegular,
      letterSpacing,
    } = values
    const theme = await Theme.findOneAndUpdate(
      { _id, appName },
      { $set: {
        'typography.fontFamily': fontFamily,
        'typography.fontSize': fontSize,
        'typography.fontWeightLight': fontWeightLight,
        'typography.fontWeightMedium': fontWeightMedium,
        'typography.fontWeightRegular': fontWeightRegular,
        'typography.letterSpacing': letterSpacing,
        }
      },
      { new: true }
    )
    if (!theme) throw Error(`Theme update of ${themeItem}`)
    return res.send(theme)
  } else if (themeItemChild)  {
    const set = { $set: {}}
    set.$set[themeItem + "." + themeItemChild] = newValues
    const theme = await Theme.findOneAndUpdate({ _id, appName }, set,{ new: true })
    if (!theme) throw Error(`Theme update ${themeItem} ${themeItemChild} failed`)
    return res.send(theme)
  } else {
    const set = { $set: {}}
    set.$set[themeItem] = newValues
    const theme = await Theme.findOneAndUpdate({ _id, appName }, set, { new: true })
    if (!theme) throw Error(`Theme update ${themeItem} failed`)
    return res.send(theme)
  }
}






// Delete
export const remove = async (req, res) => {
  const {
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Theme remove failed, Invalid id')
  const theme = await Theme.findOne({ _id, appName })
  await theme.remove()
  if (!theme) throw 'Theme remove Theme.findOneAndRemove() error'
  return res.send(theme._id)
}
