import { ObjectID } from 'mongodb'

import Comment from '../models/Comment'
import Review from '../models/Review'
import sendGmail from '../utils/sendGmail'

export const add = async (req, res) => {
  const {
    body: { parent, values, review, href, itemName },
    appName,
    user
  } = req
  const add = {
    appName,
    user: ObjectID(user._id),
    parent,
    values,
    review
  }
  const doc = await new Comment({ ...add }).save()
  const comment = await Comment.findOne({ _id: doc._id })

  if (!comment) throw Error('New comment add error')
  res.send(comment)

  const parentDoc = parent ? await Comment.findOne({ parent }) : await Review.findOne({ _id: review })
  const mailData = await sendGmail({
    appName,
    adminSubject: `New comment received!`,
    adminBody: `
      <p>${user.values.firstName} ${user.values.lastName} just commented on ${parentDoc.user.values.firstName} ${parentDoc.user.values.lastName}'s ${parent ? 'comment' : 'review'} of <a href="${href}#${comment._id}">${itemName}</a>!</p>
      <p style="font-style: italic;">${values.text}</p>
    `
  })
}


export const update = async (req, res) => {
  const {
    body: { values, like, unlike, href, itemName },
    params: { _id },
    appName,
    user,
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Comment update error, invalid id')
  const update = values ? { $set: { values }} : like ? { $push: { likes: like }} : unlike ? { $pull: { likes: unlike }} : null
  const comment = await Comment.findOneAndUpdate(
    { _id, appName, user: user._id },
    update,
    { new: true }
  )
  .populate({
    path: 'user',
    select: 'values.firstName values.lastName _id'
  })

  res.send(comment)

  if (values) {
    const mailData = await sendGmail({
      appName,
      adminSubject: `Comment Updated!`,
      adminBody: `
        <p>${user.values.firstName} ${user.values.lastName} just updated their comment for <a href="${href}#${comment._id}">${itemName}</a>!</p>
        <p style="font-style: italic;">${values.text}</p>
      `
    })
  }
}



export const get = async (req, res) => {
  const {
    appName,
    query: { userId, reviewId },
    user
  } = req
  const comments = await Comment.find({ appName, review: reviewId })
  return res.send(comments)
}





export const reportAbuse = async (req, res) => {
  const {
    appName,
    body: { comment, href, itemName},
    user
  } = req
  const mailData = await sendGmail({
    appName,
    adminSubject: `Abuse reported on comment ${comment._id}!`,
    adminBody: `
      <p>${user.values.firstName} ${user.values.lastName} just reported abuse regarding comment ${comment._id} <a href="${href}">${itemName}</a>!</p>
    `
  })

  return res.send(mailData)
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
