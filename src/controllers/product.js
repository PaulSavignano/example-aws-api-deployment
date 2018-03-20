import { ObjectID } from 'mongodb'

import { deleteFiles, uploadFile } from '../utils/s3'
import { getTime } from '../utils/formatDate'
import handleImage from '../utils/handleImage'
import Product from '../models/Product'
import slugIt from '../utils/slugIt'

export const add = async (req, res) => {
  const {
    body: { values },
    appName,
  } = req
  const _id = new ObjectID()
  // handle new background image and return object
  const newImageValues = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${appName}/products/${slugIt(values.name)}-${_id}-image_${getTime()}.${values.image.ext}`,
      image: values.image,
    })
  } : null

  const newValues = newImageValues ? newImageValues : values

  const product = await new Product({
    _id,
    appName,
    values: newValues,
  }).save()
  if (!product) throw Error('No product was found')
  return res.send(product)
}






export const get = async (req, res) => {
  const {
    appName,
    query: { lastId, limit },
  } = req
  const params = lastId ? { _id: { $gt: lastId }, appName } : { appName }
  const products = await Product.aggregate([
    { $match: params },
    { $lookup: {
      from: 'reviews',
      localField: '_id',
      foreignField: 'item',
      as: 'reviews'
    }},
    { $project: {
      _id: "$$ROOT._id",
      values: "$$ROOT.values",
      stars: { $sum: "$reviews.values.rating" },
      reviews: { $size: "$reviews" }
    }}
  ])
  .limit(parseInt(limit))
  return res.send(products)
}




export const getId = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Product id not found, invalid id')
  const product = await Product.findOne({ appName, _id })
  return res.send(product)
}





export const update = async (req, res) => {
  const {
    body: { values, oldSrcs },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Product update error, invalid id')
  const imageDeletes = oldSrcs.length && await deleteFiles(oldSrcs)
  // handle new image
  const newImageValues = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${appName}/products/${slugIt(values.name)}-${_id}-image_${formatDate(new Date())}.${values.image.ext}`,
      image: values.image,
    })
  } : null

  const newValues = newImageValues ? newImageValues : values

  const product = await Product.findOneAndUpdate(
    { _id, appName },
    { $set: { values: newValues }},
    { new: true }
  )
  if (!product) throw Error('Product to update was not found')

  return res.send(product)
}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Product delete error, invalid id')
  const product = await Product.findOne({ _id, appName })
  await product.remove()
  if (!product) throw Error('Product remove failed')
  return res.send(product._id)
}
