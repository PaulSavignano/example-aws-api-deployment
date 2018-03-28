import { ObjectID } from 'mongodb'

import Review from '../models/Review'
import Order from '../models/Order'

export const add = async (req, res) => {
  const {
    body: {
      item,
      kind,
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
  console.log('doc', doc._id)
  const review = await Review.findOne({ _id: doc._id })
  if (!review) throw Error('New review add error')
  return res.send(review)
}




export const get = async (req, res) => {
  const {
    appName,
    query: { kind, item, lastId, userId, limit, reviewId },
    user
  } = req
  console.log('req', req.query)
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
  console.log('reviews are ', reviews)
  return res.send(reviews)

}







export const getGraph = async (req, res) => {
  const {
    appName,
    query: { kind, item, lastId, userId, limit, reviewId },
    user
  } = req
  console.log('req', req.query)
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
    body: { update },
    appName,
    params: { _id },
    user,
  } = req
  console.log('update is ', req.body)
  if (!ObjectID.isValid(_id)) throw Error('Review update error, invalid id')
  const review = await Review.findOneAndUpdate(
    { _id, appName, user: user._id },
    { $set: { ...update }},
    { new: true }
  )
  .populate({ path: 'user', select: 'values.firstName _id' })
  .populate('item')
  if (!review) throw Error('Review update error')
  return res.send(review)
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
  .populate({ path: 'user', select: 'values.firstName _id' })
  .populate('item')
  console.log('review', review)
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
