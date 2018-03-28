import { ObjectID } from 'mongodb'

import Comment from '../models/Comment'

export const add = async (req, res) => {
  const {
    body,
    appName,
    user
  } = req
  const comment = await new Comment({
    appName,
    user: user._id,
    ...req.body
  }).save()
  if (!comment) throw Error('New comment add error')
  return res.send(comment)
}



export const get = async (req, res) => {
  const {
    appName,
    query: { userId, reviewId },
    user
  } = req
  const comments = await Comment.find({ appName, review: reviewId })
  console.log('comments are ', comments)
  return res.send(comments)
}




export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Comment remove error, invalid id')
  const comment = await Comment.findOneAndRemove({ _id, appName })
  if (!comment) throw Error('Comment remove error, comment not found')
  return res.send(comment._id)
}
