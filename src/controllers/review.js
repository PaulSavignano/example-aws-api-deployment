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
    params: { brandName },
    user
  } = req
  const review = await new Review({
    brandName,
    item,
    kind,
    user: user._id,
    values,
  }).save()
  if (!review) throw Error('New review add error')
  return res.send(review)
}




export const get = async (req, res) => {
  const {
    params: { brandName },
    query: { kind, item, lastId, userId, limit, reviewId },
    user
  } = req
  const kindQuery = kind && { kind }
  const itemQuery = item && { item: item }
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const userIdQuery = userId && { user: userId }
  const reviewIdQuery = reviewId && { _id: reviewId }
  const query = {
    brandName,
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







export const update = async (req, res) => {
  const {
    body: { values },
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review update error, invalid id')
  const review = await Review.findOneAndUpdate(
    { _id, brandName },
    { $set: { values }},
    { new: true }
  )
  if (!review) throw Error('Review update error')
  return res.send(review)
}



export const remove = async (req, res) => {
  const {
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review remove error, invalid id')
  const review = await Review.findOneAndRemove({ _id, brandName })
  if (!review) throw Error('Review remove error, review not found')
  return res.send(review._id)
}
