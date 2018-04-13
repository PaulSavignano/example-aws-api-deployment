import { ObjectID } from 'mongodb'

import { deleteFiles } from '../utils/s3'
import getTime from '../utils/getTime'
import App from '../models/App'
import AppPages from '../models/AppPages'
import Blog from '../models/Blog'
import Config from '../models/Config'
import handleImage from '../utils/handleImage'
import Page from '../models/Page'
import Product from '../models/Product'
import Theme from '../models/Theme'



export const add = async (req, res) => {
  const { appName } = req
  await new Config({ appName }).save()
  const page = await new Page({ appName, 'values.name': 'Home', slug: 'home', published: true }).save()
  const app = await new App({ appName }).save()
  const appPages = await new AppPages({ appName, pages: page._id }).save()
  const theme = await new Theme({ appName }).save()
  return res.send({
    app,
    appPages,
    page,
    theme,
  })
}






export const get = async (req, res) => {
  const { appName } = req
  const appDoc = await App.findOne({ appName })
  if (!appDoc) throw 'No app found'
  const product = await Product.findOne({ appName, published: true })
  const hasProducts = product ? true : false
  const blog = await Blog.findOne({ appName, published: true })
  const hasBlogs = blog ? true : false
  const appObj = appDoc.toObject()
  const app = { ...appObj, hasBlogs, hasProducts }
  res.send(app)
}






export const update = async (req, res) => {
  const {
    body: { key, oldImageSrc, values },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('App update failed, Invalid id')
  oldImageSrc && await deleteFiles([{ Key: oldImageSrc }])

  const valuesUpdate = values && values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${appName}/${key}-image_${getTime()}.${values.image.ext}`,
      image: values.image,
    })
  } : values

  if (key) {
    const app = await App.findOneAndUpdate(
      { _id, appName },
      { $set: {
        [key]: valuesUpdate
      }},
      { new: true }
    )
    if (!app) throw Error('App update failed')
    return res.send(app)
  } else {
    throw Error('App update failed, Invalid params')
  }
}






export const updateOrder = async (req, res) => {
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
  if (!appPages) throw Error('AppPages set pages failed')
  return res.send(appPages)
}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('App remove failed, Invalid id')
  const app = await App.findOne({ _id, appName })
  await app.remove()
  if (!app) throw 'App remove App.findOneAndRemove() error'
  return res.send(app._id)
}
