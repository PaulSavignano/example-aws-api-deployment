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
  console.log('userHasOrdered', userHasOrdered, 'kindId', kindId)
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



export const getAdmin = async (req, res) => {
  const { brandName, page } = req.params
  const limit = 9
  const reviews = await Review.find({ brandName })
  .skip((limit * page) - limit)
  .limit(limit)
  return res.send(reviews)
}



export const getId = async (req, res) => {
  const { brandName, _id } = req.params
  const reviews = await Review.find({ brandName, _id })
  return res.send(reviews)
}


export const getKindId = async (req, res) => {
  const { brandName, page, kindId } = req.params
  const limit = 9
  const reviews = await Review.find({ brandName, 'kind.kindId': kindId })
  .skip((limit * page) - limit)
  .limit(limit)
  return res.send(reviews)
}


export const getKind = async (req, res) => {
  const {
    params: {
      brandName,
      page,
      kind
    },
    user
  } = req
  const isAdmin = user.roles.some(role => role === 'admin')
  const limit = 9
  const query = isAdmin ? { brandName, 'kind.kind': kind } : { brandName, 'kind.kind': kind, user: user._id }
  const reviews = await Review.find(query)
  .skip((limit * page) - limit)
  .limit(limit)
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
