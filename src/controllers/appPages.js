import { ObjectID } from 'mongodb'

import { deleteFiles } from '../utils/s3'
import getTime from '../utils/getTime'
import AppPages from '../models/AppPages'
import CustomError from '../utils/CustomError'
import Page from '../models/Page'



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
  console.log('updateOrder', _id, appName)
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
  await page.remove()
  return res.send(appPages._id)
}
