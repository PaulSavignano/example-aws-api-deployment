import { ObjectID } from 'mongodb'
import formatDate from '../utils/formatDate'

import { deleteFiles, uploadFile } from '../utils/s3'
import Blog from '../models/Blog'
import ErrorObject from '../utils/ErrorObject'
import handleImage from '../utils/handleImage'
import Page from '../models/Page'
import Section from '../models/Section'


export const add = async (req, res) => {
  const {
    body: { values },
    params: { brandName }
  } = req
  const _id = new ObjectID()

  const valuesWithNewImage = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
    ...values,
    image: await handleImage({
      path: `${brandName}/blogs/${values.title}-${_id}-image_${formatDate(new Date())}.${values.image.ext}`,
      image: values.image,
    })
  } : null

  const newValues = valuesWithNewImage ? valuesWithNewImage : values

  const blog = await new Blog({
    brandName,
    values: newValues,
  }).save()
  if (!blog) throw 'No blog was found'
  return res.send(blog)
}




export const get = async (req, res) => {
  const { brandName } = req.params
  const blogs = await Blog.find({ brandName })
  return res.send(blogs)
}





export const getId = async (req, res) => {
  const { brandName, _id } = req.params
  if (!ObjectID.isValid(_id)) throw Error('Get blog failed, invalid id')
  const blog = await Blog.findOne({ brandName, _id  })
  if (!blog) throw Error('That blog was not found')
  return res.send(blog)
}




export const update = async (req, res) => {
  const {
    body: { values, oldSrcs, published },
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Blog update failed, Invalid id')
  if (values) {
    const imageDeletes = oldSrcs.length && await deleteFiles(oldSrcs)

    const valuesWithNewImage = values.image && values.image.src && values.image.src.indexOf('data') !== -1 ? {
      ...values,
      image: await handleImage({
        path: `${brandName}/blogs/${values.title}-${_id}-image_${formatDate(new Date())}.${values.image.ext}`,
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
  if (!ObjectID.isValid(_id)) throw Error('Blog remove failed, Invalid id')
  const blog = await Blog.findOne({ _id, brandName })
  await blog.remove()
  if (!blog) throw Error('That blog was not found')
  return res.send(blog._id)
}
