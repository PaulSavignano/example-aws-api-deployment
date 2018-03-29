import { ObjectID } from 'mongodb'

import Comment from '../models/Comment'

export const add = async (req, res) => {
  const {
    body: { parent, values, review },
    appName,
    user
  } = req
  const add = {
    appName,
    user: user._id,
    parent,
    values,
    review
  }
  const newComment = await new Comment({ ...add }).save()
  const comment = await Comment.findOne({ _id: newComment._id })
  .populate({
    path: 'user',
    select: 'values.firstName values.lastName _id'
  })
  if (!comment) throw Error('New comment add error')
  console.log('comment', comment)
  return res.send(comment)
}


export const update = async (req, res) => {
  const {
    body: { values, like, disLike },
    params: { _id },
    appName,
    user,
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Comment update error, invalid id')
  const update = values ? { $set: { values }} : like ? { $push: { likes: like }, $pull: { disLikes: like }} : disLike ? { $push: { disLikes: disLike }, $pull: { likes: disLike }} : null
  const comment = await Comment.findOneAndUpdate(
    { _id, appName, user: user._id },
    update,
    { new: true }
  )
  .populate({
    path: 'user',
    select: 'values.firstName values.lastName _id'
  })
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
