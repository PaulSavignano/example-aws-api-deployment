import { ObjectID } from 'mongodb'

import Page from '../models/Page'
import Product from '../models/Product'
import Section from '../models/Section'
import { deleteFiles, uploadFile } from '../utils/s3'
import handleImage from '../utils/handleImage'
import formatDate from '../utils/formatDate'
import slugIt from '../utils/slugIt'

export const add = async (req, res) => {
  const {
    body: { values },
    params: { brandName }
  } = req
  const _id = new ObjectID()
  // handle new background image and return object
  const newImageValues = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${brandName}/products/${slugIt(values.name)}-${_id}-image_${formatDate(new Date())}.${values.image.ext}`,
      image: values.image,
    })
  } : null

  const newValues = newImageValues ? newImageValues : values

  const product = await new Product({
    brandName,
    values: newValues,
  }).save()
  if (!product) throw Error('No product was found')
  return res.send(product)
}






export const get = async (req, res) => {
  const { brandName } = req.params
  const products = await Product.find({ brandName })
  return res.send(products)
}








export const update = async (req, res) => {
  if (!ObjectID.isValid(req.params._id)) return res.status(404).send('Invalid id')
  const {
    body: { values, oldSrcs },
    params: { _id, brandName }
  } = req
  const imageDeletes = oldSrcs.length && await deleteFiles(oldSrcs)
  // handle new image
  const newImageValues = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${brandName}/products/${slugIt(values.name)}-${_id}-image_${formatDate(new Date())}.${values.image.ext}`,
      image: values.image,
    })
  } : null

  const newValues = newImageValues ? newImageValues : values

  const product = await Product.findOneAndUpdate(
    { _id, brandName },
    { $set: { values: newValues }},
    { new: true }
  )
  if (!product) throw Error('Product to update was not found')

  return res.send(product)
}






export const remove = async (req, res) => {
  if (!ObjectID.isValid(req.params._id)) return res.status(404).send('Invalid id')
  const {
    params: { _id, brandName }
  } = req
  const product = await Product.findOne({ _id, brandName })
  await product.remove()
  if (!product) throw Error('Product remove failed')
  return res.send(product._id)
}
