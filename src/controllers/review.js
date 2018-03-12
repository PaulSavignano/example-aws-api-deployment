import { ObjectID } from 'mongodb'

import Review from '../models/Review'
import Order from '../models/Order'

const limit = 9

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
    kind: { kindId: kindId, kind: 'blog' },
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
      kind: { kindId: kindId, kind: 'product' },
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
    query: { lastId, limit },
    user
  } = req
  const params = lastId ? { _id: { $gt: lastId }, brandName, user: user._id } : { brandName, user: user._id }
  const reviews = await Review.find(params)
  .limit(parseInt(limit))
  return res.send(addresses)
}

export const getId = async (req, res) => {
  const {
    params: { brandName, _id },
    user
  } = req
  const review = await Review.findOne({ user: user._id, brandName, _id })
  return res.send(review)
}


export const adminGetUser = async (req, res) => {
  const {
    params: { brandName },
    query: { userId, lastId, limit },
    user
  } = req
  const params = lastId ? { _id: { $gt: lastId }, brandName, user: userId } : { brandName, user: userId }
  const reviews = await Review.find({ brandName, user: userId })
  .limit(parseInt(limit))
  return res.send(reviews)
}


export const adminGetId = async (req, res) => {
  const {
    params: { brandName, _id },
    user
  } = req
  const review = await Review.findOne({ brandName, _id })
  return res.send(review)
}


export const adminGetAll = async (req, res) => {
  const {
    params: { brandName },
    query: { lastId, limit },
    user
  } = req
  const params = lastId ? { _id: { $gt: lastId }, brandName } : { brandName }
  const reviews = await Review.find(params)
  .limit(parseInt(limit))
  return res.send(reviews)
}


export const getKindId = async (req, res) => {
  const {
    params: { brandName },
    query: { kindId, lastId, limit },
  } = req
  const params = lastId ? { _id: { $gt: lastId }, brandName, 'kind.kindId': kindId } : { brandName, 'kind.kindId': kindId }
  const reviews = await Review.find(params)
  .limit(parseInt(limit))
  return res.send(reviews)
}


export const getKind = async (req, res) => {
  const {
    params: { brandName },
    query: { kind, lastId, limit },
    user,
  } = req
  const params = lastId ? { _id: { $gt: lastId }, brandName, 'kind.kind': kind, user: user._id } : { brandName, 'kind.kind': kind, user: user._id }
  const reviews = await Review.find(params)
  .limit(parseInt(limit))
  return res.send(reviews)
}

export const getAdminKind = async (req, res) => {
  const {
    params: { brandName },
    query: { kind, lastId, limit },
  } = req
  const params = lastId ? { _id: { $gt: lastId }, brandName, 'kind.kind': kind } : { brandName, 'kind.kind': kind }
  const reviews = await Review.find(params)
  .limit(parseInt(limit))
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
