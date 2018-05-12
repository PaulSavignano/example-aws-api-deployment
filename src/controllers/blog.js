import { ObjectID } from 'mongodb'

import { deleteFiles, uploadFile } from '../utils/s3'
import getSlug from '../utils/getSlug'
import getTime from '../utils/getTime'
import Blog from '../models/Blog'
import getQuery from '../utils/getQuery'
import getCursorSort from '../utils/getCursorSort'



export const add = async (req, res) => {
  const {
    body: { values },
    appName,
  } = req
  const _id = new ObjectID()

  const valuesWithNewImage = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: {
      style: { ...values.image.style },
      src: await uploadFile({
        Key: `${appName}/blogs/${getSlug(values.title)}-${_id}-image_${getTime()}.${values.image.ext}`,
        Body: new Buffer(values.image.src.replace(/^data:image\/\w+;base64,/, ""),'base64'),
      })
    }
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
  const blogs = await Blog.find(query)
  .sort(cursorSort)
  .limit(limitInt)
  return res.send(blogs)
}






export const adminGet = async (req, res) => {
  const {
    appName,
    query: {
      _id,
      lastId,
      lastRating,
      sort,
      limit,
      published,
      userId,
    },
  } = req
  const query = getQuery({
    appName,
    _id,
    lastId,
    lastRating,
    limit,
    published,
    sort,
    userId
  })
  const cursorSort = getCursorSort({ sort, rating: 'values.rating' })
  const limitInt = limit ? parseInt(limit) : 3
  const blogs = await Blog.find(query)
  .sort(cursorSort)
  .limit(limitInt)
  return res.send(blogs)
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
    image: {
      style: { ...values.image.style },
      src: await uploadFile({
        Key: `${appName}/blogs/${getSlug(values.title)}-${_id}-image_${getTime()}.${values.image.ext}`,
        Body: new Buffer(values.image.src.replace(/^data:image\/\w+;base64,/, ""),'base64'),
      })
    }
  } : values

  const set = values ? { values: valuesUpdate } : typeof published === 'undefined' ? null : { published }
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
  if (!ObjectID.isValid(_id)) throw Error('Blog remove error, invalid _id')
  const blog = await Blog.findOne({ _id, appName })
  await blog.remove()
  if (!blog) throw Error('That blog was not found')
  return res.send(blog._id)
}
