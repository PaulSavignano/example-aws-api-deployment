import { ObjectID } from 'mongodb'

import { deleteFiles } from '../utils/s3'
import getTime from '../utils/getTime'
import handleImage from '../utils/handleImage'
import Product from '../models/Product'
import getSlug from '../utils/getSlug'
import getQuery from '../utils/getQuery'
import getCursorSort from '../utils/getCursorSort'



export const add = async (req, res) => {
  const {
    body: { values },
    appName,
  } = req
  const _id = new ObjectID()
  // handle new background image and return object
  const valuesUpdate = values && values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${appName}/products/${getSlug(values.name)}-${_id}-image_${getTime()}.${values.image.ext}`,
      image: values.image,
    })
  } : values

  const product = await new Product({
    _id,
    appName,
    values: valuesUpdate,
  }).save()
  if (!product) throw Error('No product was found')
  return res.send(product)
}






export const get = async (req, res) => {
  const {
    appName,
    query: {
      _id,
      lastId,
      lastRating,
      sort,
      limit,
      userId,
    },
  } = req
  const query = getQuery({
    appName,
    _id,
    lastId,
    lastRating,
    limit,
    published: 'true',
    sort,
    userId
  })
  const cursorSort = getCursorSort({ sort, rating: 'values.rating' })
  const limitInt = limit ? parseInt(limit) : 3
  const products = await Product.find(query)
  .sort(cursorSort)
  .limit(limitInt)
  return res.send(products)
}






export const adminGet = async (req, res) => {
  const {
    appName,
    query: {
      _id,
      lastId,
      lastPrice,
      lastRating,
      limit,
      published,
      sort,
      userId,
    },
  } = req
  const query = getQuery({
    _id,
    appName,
    lastId,
    lastPrice,
    lastRating,
    limit,
    published,
    sort,
    userId
  })
  const cursorSort = getCursorSort({ sort, rating: 'values.rating' })
  const limitInt = limit ? parseInt(limit) : 3
  const products = await Product.find(query)
  .sort(cursorSort)
  .limit(limitInt)
  return res.send(products)
}






export const update = async (req, res) => {
  const {
    body: { values, oldSrcs, published },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Blog update error, invalid _id')

  oldSrcs && oldSrcs.length && await deleteFiles(oldSrcs)
  const valuesUpdate = values && values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${appName}/blogs/${values.title}-${_id}-image_${getTime()}.${values.image.ext}`,
      image: values.image,
    })
  } : values

  const set = values ? { values: valuesUpdate } : typeof published === 'undefined' ? null : { published }
  const product = await Product.findOneAndUpdate(
    { _id, appName },
    { $set: set },
    { new: true }
  )
  if (!product) throw Error('Blog to update was not found')
  return res.send(product)
}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Product delete error, invalid _id')
  const product = await Product.findOne({ _id, appName })
  await product.remove()
  if (!product) throw Error('Product remove failed')
  return res.send(product._id)
}
