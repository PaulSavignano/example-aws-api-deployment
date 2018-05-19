import { ObjectID } from 'mongodb'

import Theme from '../models/Theme'


export const add = async (req, res) => {
  const { appName } = req
  const theme = await new Theme({ appName }).save()
  res.send(theme)
}





export const get = async (req, res) => {
  const { appName } = req
  const theme = await Theme.findOne({ appName })
  return res.send(theme)
}






export const update = async (req, res) => {
  const {
    body: {
      themeKey,
      themeKeyChild,
      values,
    },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Theme update failed, invalid _id')

  if (themeKeyChild === 'general') {
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
    if (!theme) throw Error(`Theme update of ${themeKey}`)
    return res.send(theme)
  } else if (themeKeyChild)  {
    const set = { $set: {}}
    set.$set[themeKey + "." + themeKeyChild] = values
    const theme = await Theme.findOneAndUpdate({ _id, appName }, set,{ new: true })
    if (!theme) throw Error(`Theme update ${themeKey} ${themeKeyChild} failed`)
    return res.send(theme)
  } else {
    const set = { $set: {}}
    set.$set[themeKey] = values
    const theme = await Theme.findOneAndUpdate({ _id, appName }, set, { new: true })
    if (!theme) throw Error(`Theme update ${themeKey} failed`)
    return res.send(theme)
  }
}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Theme remove failed, invalid _id')
  const theme = await Theme.findOne({ _id, appName })
  await theme.remove()
  if (!theme) throw Error('Theme remove error, no theme found')
  return res.send(theme._id)
}
