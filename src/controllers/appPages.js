import { ObjectID } from 'mongodb'

import AppPages from '../models/AppPages'



export const get = async (req, res) => {
  const { appName } = req
  const appPages = await AppPages.findOne({ appName })
  if (!appPages) throw Error('No appPages found')
  return res.send(appPages)
}




export const update = async (req, res) => {
  const {
    body: { pageIds },
    appName,
    params: { _id }
  } = req
  const appPages = await AppPages.findOneAndUpdate(
    { _id, appName },
    { $set: { pages: pageIds }},
    { new: true }
  )
  if (!appPages) throw Error('Brand set pages failed')
  return res.send(appPages)
}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Page remove failed, invalid _id')
  const appPages = await AppPages.findOne({ _id, appName })
  if (!appPages) throw Error('Page delete failed, no page found')
  await appPages.remove()
  return res.send(appPages._id)
}
