import { ObjectID } from 'mongodb'

import { deleteFiles } from '../utils/s3'
import { getTime } from '../utils/formatDate'
import Blog from '../models/Blog'
import handleImage from '../utils/handleImage'

export const add = async (req, res) => {
  const {
    body: { values },
    appName,
  } = req
  const _id = new ObjectID()

  const valuesWithNewImage = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${appName}/blogs/${values.title}-${_id}-image_${getTime()}.${values.image.ext}`,
      image: values.image,
    })
  } : null

  const newValues = valuesWithNewImage ? valuesWithNewImage : values

  const blog = await new Blog({
    _id,
    appName,
    values: newValues,
  }).save()
  if (!blog) throw Error('No blog was found')
  return res.send(blog)
}




export const get = async (req, res) => {
  const {
    appName,
    query: { lastId, limit, _id },
  } = req
  console.log('req', req.query)
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const idQuery = _id && { _id: ObjectID(_id) }
  const limitInt = limit ? parseInt(limit) : 2
  const blogs = await Blog.aggregate([
    { $match: {
      appName,
      published: true,
      ...idQuery,
      ...lastIdQuery,
    }},
    { $lookup: {
      from: 'reviews',
      localField: '_id',
      foreignField: 'item',
      as: 'reviews'
    }},
    { $project: {
      _id: "$$ROOT._id",
      published: "$$ROOT.published",
      values: "$$ROOT.values",
      stars: { $sum: "$reviews.values.rating" },
      reviews: { $size: "$reviews" }
    }}
  ])
  .limit(limitInt)
  console.log('blogs', blogs)
  return res.send(blogs)
}



export const adminGet = async (req, res) => {
  const {
    appName,
    query: { lastId, limit, _id },
  } = req
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const idQuery = _id && { _id }
  const blogs = await Blog.aggregate([
    { $match: {
      appName,
      ...lastIdQuery,
      ...idQuery
    }},
    { $lookup: {
      from: 'reviews',
      localField: '_id',
      foreignField: 'item',
      as: 'reviews'
    }},
    { $project: {
      _id: "$$ROOT._id",
      published: "$$ROOT.published",
      values: "$$ROOT.values",
      stars: { $sum: "$reviews.values.rating" },
      reviews: { $size: "$reviews" }
    }}
  ])
  .limit(parseInt(limit))
  return res.send(blogs)
}




export const update = async (req, res) => {
  const {
    body: { values, oldSrcs, published },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Blog update error, Invalid id')

  const valuesUpdate = values && values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${appName}/blogs/${values.title}-${_id}-image_${getTime()}.${values.image.ext}`,
      image: values.image,
    })
  } : values

  const set = values ? { values: valuesUpdate } : typeof variable === 'undefined' ? null : { published }
  const blog = await Blog.findOneAndUpdate(
    { _id, appName },
    { $set: set },
    { new: true }
  )
  if (!blog) throw Error('Blog to update was not found')
  return res.send(blog)
}





export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Blog remove error, Invalid id')
  const blog = await Blog.findOne({ _id, appName })
  await blog.remove()
  if (!blog) throw Error('That blog was not found')
  return res.send(blog._id)
}
