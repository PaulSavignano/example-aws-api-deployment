import { ObjectID } from 'mongodb'

import { deleteFiles, uploadFile } from '../utils/s3'
import getTime from '../utils/getTime'
import App from '../models/App'
import AppPages from '../models/AppPages'
import Blog from '../models/Blog'
import Config from '../models/Config'
import Page from '../models/Page'
import Product from '../models/Product'
import Theme from '../models/Theme'



export const add = async (req, res) => {
  const { appName } = req
  const appPromise = new App({ appName }).save()
  const configPromise = new Config({ appName }).save()
  const pagePromise = new Page({
    appName,
    name: 'Home',
    path: '/',
    slug: 'home',
    published: true,
    'values.description': appName
  }).save()
  const themePromise = new Theme({ appName }).save()
  const [ app, config, page, theme ] = await Promise.all([ appPromise, configPromise, pagePromise, themePromise ])
  const appPages = await new AppPages({ appName, pages: page._id }).save()
  return res.send({
    app,
    appPages,
    page,
    theme,
  })
}






export const get = async (req, res) => {
  const { appName } = req
  const appPromise = App.findOne({ appName })
  const productPromise = Product.findOne({ appName, published: true })
  const blogPromise = Blog.findOne({ appName, published: true })

  const [ appDoc, product, blog ] = await Promise.all([ appPromise, productPromise, blogPromise ])
  if (!appDoc) throw Error('No app found')
  const hasBlogs = blog ? true : false
  const hasProducts = product ? true : false
  const appObj = appDoc.toObject()
  const app = { ...appObj, hasBlogs, hasProducts }
  return res.send(app)
}






export const update = async (req, res) => {
  const {
    body: { appKey, oldImageSrc, values },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('App update failed, invalid _id')
  oldImageSrc && await deleteFiles([{ Key: oldImageSrc }])

  const valuesUpdate = values && values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: {
      style: { ...values.style },
      src: await uploadFile({
        Key: `${appName}/${appKey}-image_${getTime()}.${values.image.ext}`,
        Body: new Buffer(values.image.src.replace(/^data:image\/\w+;base64,/, ""),'base64'),
      })
    }
  } : values

  if (appKey) {
    const app = await App.findOneAndUpdate(
      { _id, appName },
      { $set: {
        [appKey]: valuesUpdate
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
  if (!ObjectID.isValid(_id)) throw Error('App remove failed, invalid _id')
  const app = await App.findOne({ _id, appName })
  await app.remove()
  if (!app) throw Error('App remove error, no app found')
  return res.send(app._id)
}
