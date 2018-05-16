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

  const parentDoc = parent ? await Comment.findOne({ parent }).populate('review') : await Review.findOne({ _id: review })
  const kind = parent ? parentDoc.review.kind : parentDoc.kind
  const kindToLowerCase = kind.charAt(0).toLowerCase() + kind.slice(1)
  await sendGmail({
    appName,
    adminSubject: `New comment received for ${kindToLowerCase} ${itemName}!`,
    adminBody: `
      <p>
        ${user.values.firstName} ${user.values.lastName} just commented on ${parentDoc.user.values.firstName} ${parentDoc.user.values.lastName}'s ${parent ? 'comment' : 'review'} of
        ${kindToLowerCase}
        <a href="${href}#${comment._id}">${itemName}</a>!
      </p>
      <br/>
      <h3>
        ${user.values.firstName}'s Comment:
      </h3>
      <p style="font-style: italic;">${values.text}</p>
    `
  })
}






export const updateLikes = async (req, res) => {
  const {
    body: { like, unlike },
    params: { _id },
    appName,
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Comment update error, invalid _id')
  const update = like ? { $push: { likes: like }} : unlike ? { $pull: { likes: unlike }} : null
  const comment = await Comment.findOneAndUpdate(
    { _id, appName },
    update,
    { new: true }
  )
  .populate({
    path: 'user',
    select: 'values.firstName values.lastName _id'
  })
  res.send(comment)
}






export const updateValues = async (req, res) => {
  const {
    body: { values, href, itemName },
    params: { _id },
    appName,
    user,
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Comment update error, invalid _id')

  const comment = await Comment.findOneAndUpdate(
    { _id, appName, user: user._id },
    { $set: { values }},
    { new: true }
  )
  .populate({
    path: 'user',
    select: 'values.firstName values.lastName _id'
  })
  res.send(comment)
  const prevCommentPromise = Comment.findOne({ _id, appName })
  const parentDocPromise = comment.parent ? Comment.findOne({ _id: comment.parent }).populate('review') : Review.findOne({ _id: comment.review })
  const [ prevComment, parentDoc ] = await Promise.all([ prevCommentPromise, parentDocPromise ])
  const kind = comment.parent ? parentDoc.review.kind : parentDoc.kind
  const kindToLowerCase = kind.charAt(0).toLowerCase() + kind.slice(1)
  await sendGmail({
    appName,
    adminSubject: `Comment Updated for ${kindToLowerCase} ${itemName}!`,
    adminBody: `
      <p>${user.values.firstName} ${user.values.lastName} just updated their comment to ${parentDoc.user.values.firstName} ${parentDoc.user.values.lastName}'s ${comment.parent ? 'comment' : 'review'} of ${kindToLowerCase} <a href="${href}#${comment._id}">${itemName}</a>!</p>
      <div style="text-decoration: underline;">${user.values.firstName}'s previous comment:</div>
      <div style="font-style: italic;">${values.text}</div>
      <br/>
      <div style="text-decoration: underline;">${user.values.firstName}'s updated comment:</div>
      <div style="font-style: italic;" class="gutterBottom">${prevComment.values.text}</div>
    `
  })
}






export const get = async (req, res) => {
  const {
    appName,
    query: { reviewId },
  } = req
  const comments = await Comment.find({ appName, review: reviewId })
  return res.send(comments)
}






export const reportAbuse = async (req, res) => {
  const {
    appName,
    body: { comment, href, itemName},
  } = req
  const commentType = comment.kind ? 'review' : 'comment'
  const parentDoc = comment.kind ? await Review.findOne({ _id: comment._id }) : await Comment.findOne({ _id: comment._id }).populate('review')
  const itemType = comment.kind ? parentDoc.kind : parentDoc.review.kind
  const mailData = await sendGmail({
    appName,
    adminSubject: `Abuse reported on a ${commentType.charAt(0).toLowerCase() + commentType.slice(1)} for ${itemType} ${itemName}!`,
    adminBody: `
      <p>Abuse reported on the following ${commentType} for ${itemType} <a href="${href}">${itemName}</a>!</p>
      <br/>
      <h3>${commentType.charAt(0).toUpperCase() + commentType.slice(1)} text:</h3>
      <p style="font-style: italic;">${comment.values.text}</p>
    `
  })
  res.send(mailData)
}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Comment remove error, invalid _id')
  const comment = await Comment.findOneAndRemove({ _id, appName })
  await Comment.deleteMany({ parent: comment._id })
  if (!comment) throw Error('Comment remove error, comment not found')
  return res.send(comment._id)
}
