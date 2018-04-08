import { ObjectID } from 'mongodb'

import Blog from '../models/Blog'
import Product from '../models/Product'
import Review from '../models/Review'
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

  const agg = [
    { $match: { appName, _id: review.item  } },
    { $lookup: {
      from: 'reviews',
      localField: '_id',
      foreignField: 'item',
      as: 'reviews'
    }},
    { $project: {
      _id: "$$ROOT._id",
      values: "$$ROOT.values",
      stars: { $sum: "$reviews.values.rating" },
      reviews: { $size: "$reviews" }
    }}
  ]
  const products = review.kind === 'Product' ? await Product.aggregate(agg) : null
  const blogs = review.kind === 'Blog' ? await Blog.aggregate(agg) : null
  const blog = blogs && blogs.length > 0 ? blogs[0] : null
  const product = products && products.length > 0 ? products[0] : null
  const response = { review, product, blog }
  res.send({ ...response })

  const emailSummary = `
    <div style="text-decoration: underline">Review Summary</div>
    <div>Stars: ${values.rating}</div>
    <div>Review: ${values.text}</div>
  `
  console.log('user email is ', user.values.email)
  await sendGmail({
    appName,
    toEmail: user.values.email,
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
  .populate('item')
  .limit(parseInt(limit))
  return res.send(reviews)
}






export const updateLikes = async (req, res) => {
  const {
    body: { like, unlike },
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review update error, invalid id')
  const update = like ? { $push: { likes: like }} : unlike ? { $pull: { likes: unlike }} : null
  const review = await Review.findOneAndUpdate(
    { _id, appName },
    update,
    { new: true }
  )
  .populate({ path: 'user', select: 'values.firstName values.lastName _id' })
  if (!review) throw Error('Review update error')
  res.send({ review })
}





export const updateValues = async (req, res) => {
  const {
    body: { values, href, itemName, published },
    appName,
    params: { _id },
    user,
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review update error, invalid id')
  const prevReview = await Review.findOne({ _id, appName })
  const hasNewRating = prevReview.values.rating !== values.rating ? true : false
  const update = values ? { $set: { values }} : { $set: { published }}
  const review = await Review.findOneAndUpdate(
    { _id, appName },
    update,
    { new: true }
  )
  .populate({ path: 'user', select: 'values.firstName values.lastName _id' })
  if (!review) throw Error('Review update error')

  const agg = hasNewRating ? [
    { $match: { appName, _id: review.item  } },
    { $lookup: {
      from: 'reviews',
      localField: '_id',
      foreignField: 'item',
      as: 'reviews'
    }},
    { $project: {
      _id: "$$ROOT._id",
      values: "$$ROOT.values",
      stars: { $sum: "$reviews.values.rating" },
      reviews: { $size: "$reviews" }
    }}
  ] : null
  const products = hasNewRating && review.kind === 'Product' ? await Product.aggregate(agg) : null
  const blogs = hasNewRating && review.kind === 'Blog' ? await Blog.aggregate(agg) : null
  const blog = blogs && blogs.length > 0 ? blogs[0] : null
  const product = products && products.length > 0 ? products[0] : null
  const response = { review, product, blog }
  res.send({ ...response })
  await sendGmail({
    appName,
    adminSubject: `Review Updated for ${itemName}!`,
    adminBody: `
      <p>${user.values.firstName} ${user.values.lastName} just updated their review for <a href="${href}#${reivew._id}">${itemName}</a>!</p>
      <div style="text-decoration: underline">${user.values.firstName}'s previous review</div>
      <div>Stars: ${prevReview.values.rating}</div>
      <div>Review: ${prevReview.values.text}</div>
      <br/>
      <div style="text-decoration: underline">${user.values.firstName}'s updated review</div>
      <div>Stars: ${values.rating}</div>
      <div>Review: ${values.text}</div>
    `
  })
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
