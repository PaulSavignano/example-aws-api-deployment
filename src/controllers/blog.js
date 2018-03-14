import { ObjectID } from 'mongodb'

import { deleteFiles, uploadFile } from '../utils/s3'
import { getTime } from '../utils/formatDate'
import Blog from '../models/Blog'
import handleImage from '../utils/handleImage'

export const add = async (req, res) => {
  const {
    body: { values },
    params: { brandName }
  } = req
  const _id = new ObjectID()

  const valuesWithNewImage = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${brandName}/blogs/${values.title}-${_id}-image_${getTime()}.${values.image.ext}`,
      image: values.image,
    })
  } : null

  const newValues = valuesWithNewImage ? valuesWithNewImage : values

  const blog = await new Blog({
    _id,
    brandName,
    values: newValues,
  }).save()
  if (!blog) throw Error('No blog was found')
  return res.send(blog)
}




export const get = async (req, res) => {
  const {
    params: { brandName },
    query: { lastId, limit },
  } = req
  const params = lastId ? { _id: { $gt: lastId }, brandName } : { brandName }
  const blogs = await Blog.aggregate([
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
  return res.send(blogs)
}





export const getId = async (req, res) => {
  const { brandName, _id } = req.params
  if (!ObjectID.isValid(_id)) throw Error('Blog not found, invalid id')
  const blog = await Blog.findOne({ brandName, _id  })
  if (!blog) throw Error('That blog was not found')
  return res.send(blog)
}




export const update = async (req, res) => {
  const {
    body: { values, oldSrcs, published },
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Blog update error, Invalid id')
  if (values) {
    const imageDeletes = oldSrcs.length && await deleteFiles(oldSrcs)

    const valuesWithNewImage = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
      ...values,
      image: await handleImage({
        path: `${brandName}/blogs/${values.title}-${_id}-image_${getTime()}.${values.image.ext}`,
        image: values.image,
      })
    } : null
    const newValues = valuesWithNewImage ? valuesWithNewImage : values

    const blog = await Blog.findOneAndUpdate(
      { _id, brandName },
      { $set: { values: newValues }},
      { new: true }
    )
    if (!blog) throw Error('Blog to update was not found')
    return res.send(blog)
  } else {
    const blog = await Blog.findOneAndUpdate(
      { _id, brandName },
      { $set: { published }},
      { new: true }
    )
    if (!blog) throw Error('Blog to update was not found')
    return res.send(blog)
  }
}





export const remove = async (req, res) => {
  const {
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Blog remove error, Invalid id')
  const blog = await Blog.findOne({ _id, brandName })
  await blog.remove()
  if (!blog) throw Error('That blog was not found')
  return res.send(blog._id)
}
