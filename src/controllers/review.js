import { ObjectID } from 'mongodb'

import Review from '../models/Review'
import Order from '../models/Order'

export const addBlogReview = async (req, res) => {
  const {
    body: {
      kindId,
      kind,
      values,
    },
    params: { brandName },
    user
  } = req
  const review = await new Review({
    brandName,
    kindId: kindId,
    kind: 'blog',
    user: user._id,
    values,
  }).save()
  if (!review) throw Error('New review add error')
  return res.send(review)
}


export const addProductReview = async (req, res) => {
  const {
    body: {
      kindId,
      kind,
      values,
    },
    params: { brandName },
    user
  } = req
  const userHasOrdered = await Order.findOne({
    user: user._id,
    'cart.items.productId': kindId
  })
  if (userHasOrdered) {
    const review = await new Review({
      brandName,
      kindId: kindId,
      kind: 'product',
      user: user._id,
      values,
    }).save()
    if (!review) throw Error('New review add error')
    return res.send(review)
  }
  throw Error('User has not puchased that product before')
}








export const get = async (req, res) => {
  const {
    params: { brandName },
    query: { kind, kindId, lastId, userId, limit },
    user
  } = req
  const kindQuery = kind && { kind }
  const kindIdQuery = kindId && { kindId }
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const userIdQuery = userId && { _id: userId }
  console.log('kindIdQuery', kindIdQuery)
  const query = {
    brandName,
    ...kindQuery,
    ...kindIdQuery,
    ...lastIdQuery,
    ...userIdQuery,
  }
  console.log('query', query)
  const reviews = await Review.find(query)
  .limit(parseInt(limit))
  console.log('reviews', reviews)
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
