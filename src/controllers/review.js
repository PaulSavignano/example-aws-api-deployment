import { ObjectID } from 'mongodb'

import Review from '../models/Review'
import Order from '../models/Order'
import sendGmail from '../utils/sendGmail'

export const add = async (req, res) => {
  const {
    body: {
      item,
      kind,
      itemName,
      href,
      values,
    },
    appName,
    user
  } = req

  const doc = await new Review({
    appName,
    item,
    kind,
    user: user._id,
    values,
  }).save()
  const review = await Review.findOne({ _id: doc._id })
  if (!review) throw Error('New review add error')
  res.send(review)
  const emailSummary = `
    <div style="text-decoration: underline">Review Summary</div>
    <div>Stars: ${values.rating}</div>
    <div>Review: ${values.text}</div>
  `
  const mailData = await sendGmail({
    appName,
    to: user.values.email,
    toSubject: 'Thank you for your review!',
    toBody: `
      <p>Hi ${user.values.firstName},</p>
      <p>We appreciate you taking to time to write a review for <a href="${href}#${review._id}">${itemName}</a>.</p>
      ${emailSummary}
    `,
    adminSubject: `New review received!`,
    adminBody: `
      <p>${user.values.firstName} ${user.values.lastName} just added a review for <a href="${href}#${review._id}">${itemName}</a>!</p>
      ${emailSummary}
    `
  })
}




export const get = async (req, res) => {
  const {
    appName,
    query: { kind, item, lastId, userId, limit, reviewId },
    user
  } = req
  const kindQuery = kind && { kind }
  const itemQuery = item && { item: item }
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const userIdQuery = userId && { user: userId }
  const reviewIdQuery = reviewId && { _id: reviewId }
  const query = {
    appName,
    ...kindQuery,
    ...itemQuery,
    ...lastIdQuery,
    ...userIdQuery,
    ...reviewIdQuery,
  }
  if (item) {
    const reviews = await Review.find(query)
    .limit(parseInt(limit))
    return res.send(reviews)
  }
  const reviews = await Review.find(query)
  .limit(parseInt(limit))
  .populate('item')
  return res.send(reviews)

}







export const getGraph = async (req, res) => {
  const {
    appName,
    query: { kind, item, lastId, userId, limit, reviewId },
    user
  } = req
  const kindQuery = kind && { kind }
  const itemQuery = item && { item: item }
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const userIdQuery = userId && { user: userId }
  const reviewIdQuery = reviewId && { _id: reviewId }
  const query = {
    appName,
    ...kindQuery,
    ...itemQuery,
    ...lastIdQuery,
    ...userIdQuery,
    ...reviewIdQuery,
  }
  const reviews = await Review.aggregate([
    { $match: query },
    { $graphLookup: {
      from: "comments",
      startWith: "$_id",
      connectFromField: "review",
      connectToField: "review",
      as: "comments"
    }},
    { $project: {
      _id: "$_id",
      user: "$user",
      values: "$values",
      published: "$published",
      comments: "$comments"
    }},
    { $graphLookup: {
      from: "$comments",
      startWith: "parent",
      connectFromField: "_id",
      connectToField: "parent",
      as: "subcomments"
    }},
  ])
  return res.send(reviews)

}






export const update = async (req, res) => {
  const {
    body: { values, like, unlike, href, itemName },
    appName,
    params: { _id },
    user,
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review update error, invalid id')
  const update = values ? { $set: { values }} : like ? { $push: { likes: like }} : unlike ? { $pull: { likes: unlike }} : null
  const review = await Review.findOneAndUpdate(
    { _id, appName },
    update,
    { new: true }
  )
  .populate({ path: 'user', select: 'values.firstName values.lastName _id' })
  .populate('item')
  if (!review) throw Error('Review update error')
  return res.send(review)

  if (values) {
    const mailData = await sendGmail({
      appName,
      adminSubject: `Review Updated!`,
      adminBody: `
        <p>${user.values.firstName} ${user.values.lastName} just updated their review for <a href="${href}#${reivew._id}">${itemName}</a>!</p>
        <div style="text-decoration: underline">Review Summary</div>
        <div>Stars: ${values.rating}</div>
        <div>Review: ${values.text}</div>
      `
    })
  }
}


export const adminUpdate = async (req, res) => {
  const {
    body: { update },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review update error, invalid id')
  const review = await Review.findOneAndUpdate(
    { _id, appName },
    { $set: { ...update }},
    { new: true }
  )
  .populate({ path: 'user', select: 'values.firstName values.lastName _id' })
  .populate('item')
  if (!review) throw Error('Review update error')
  return res.send(review)
}



export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review remove error, invalid id')
  const review = await Review.findOneAndRemove({ _id, appName })
  if (!review) throw Error('Review remove error, review not found')
  return res.send(review._id)
}
