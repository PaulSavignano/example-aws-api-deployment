import { ObjectID } from 'mongodb'

import Blog from '../models/Blog'
import Product from '../models/Product'
import Review from '../models/Review'
import Comment from '../models/Comment'
import sendGmail from '../utils/sendGmail'
import getQuery from '../utils/getQuery'
import getCursorSort from '../utils/getCursorSort'



const handleItem = async ({ item, kind }) => {
  const itemRating = await Review.aggregate([
    { $match: {
      item,
      published: true
    }},
    { $group: {
      _id: null,
      stars: { $sum: "$values.rating" },
      avg: { $avg: "$values.rating" },
      reviews: { $sum: 1 },
    }}
  ])
  const { stars, avg, reviews } = itemRating[0]
  if (kind === 'Blog') {
    const blog = await Blog.findOne({ _id: item })
    blog.rating.avg = (avg).toFixed(1)
    blog.rating.stars = stars
    blog.rating.reviews = reviews
    await blog.save()
    return {
      blog,
      product: null
    }
  }
  if (kind === 'Product') {
    const product = await Product.findOne({ _id: item })
    product.rating.avg = (avg).toFixed(1)
    product.rating.stars = stars
    product.rating.reviews = reviews
    await product.save()
    return {
      blog: null,
      product
    }
  }
}



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
    published: values.rating < 3 ? false : true,
    user: user._id,
    values,
  }).save()

  const review = await Review.findOne({ _id: doc._id })

  if (values.rating < 3) {
    res.send({ review })
  } else {
    const { blog, product } = await handleItem({ item: review.item, kind: review.kind })
    res.send({ blog, product, review })
  }

  const emailSummary = `
    <h3>Review Summary:</h3>
    <div>Stars: ${values.rating}</div>
    <div class="gutterBottom">Review: ${values.text}</div>
  `
  await sendGmail({
    appName,
    toEmail: user.values.email,
    toSubject: `Thank you for your review of ${review.kind} ${itemName}!`,
    toBody: `
      <p>Hi ${user.values.firstName},</p>
      <p>We appreciate you taking to time to write a review for ${review.kind} <a href="${href}#${review._id}">${itemName}</a>.</p>
      <br/>
      ${emailSummary}
    `,
    adminSubject: `New review received for ${review.kind} ${itemName}!`,
    adminBody: `
      <p>${user.values.firstName} ${user.values.lastName} just added a review for ${review.kind} <a href="${href}#${review._id}">${itemName}</a>!</p>
      <br/>
      ${emailSummary}
    `
  })
}






export const get = async (req, res) => {
  const {
    appName,
    query: {
      _id,
      item,
      kind,
      lastId,
      lastRating,
      sort,
      limit,
      userId,
    },
  } = req
  const query = getQuery({
    appName,
    _id,
    item,
    kind,
    lastId,
    lastRating,
    limit,
    published: 'true',
    sort,
    userId
  })
  const cursorSort = getCursorSort({ sort, rating: 'values.rating' })
  const limitInt = limit ? parseInt(limit) : 3
  const reviews = await Review.find(query)
  .sort(cursorSort)
  .limit(limitInt)
  return res.send(reviews)
}






export const userGet = async (req, res) => {
  const {
    appName,
    query: {
      _id,
      item,
      kind,
      lastId,
      lastRating,
      limit,
      published,
      sort,
    },
    user,
  } = req
  const query = getQuery({
    _id,
    appName,
    item,
    kind,
    lastId,
    lastRating,
    limit,
    published,
    sort,
    userId: user._id,
  })
  const cursorSort = getCursorSort({ sort, rating: 'values.rating' })
  const limitInt = limit ? parseInt(limit) : 3
  if (item) {
    const reviews = await Review.find(query)
    .sort(cursorSort)
    .limit(limitInt)
    return res.send(reviews)
  }
  const reviews = await Review.find(query)
  .populate({ path: 'item', select: '_id values.name values.title values.image' })
  .sort(cursorSort)
  .limit(limitInt)
  return res.send(reviews)
}





export const adminGet = async (req, res) => {
  const {
    appName,
    query: {
      _id,
      item,
      kind,
      lastId,
      lastRating,
      limit,
      published,
      sort,
      userId,
    },
  } = req
  const query = getQuery({
    appName,
    _id,
    item,
    kind,
    lastId,
    lastRating,
    limit,
    published,
    sort,
    userId,
  })
  const cursorSort = getCursorSort({ sort, rating: 'values.rating' })
  const limitInt = limit ? parseInt(limit) : 3
  if (item) {
    const reviews = await Review
    .find(query)
    .sort(cursorSort)
    .limit(limitInt)
    return res.send(reviews)
  }
  const reviews = await Review.find(query)
  .populate({ path: 'item', select: '_id values.name values.title values.image' })
  .sort(cursorSort)
  .limit(limitInt)
  return res.send(reviews)
}






export const updateLikes = async (req, res) => {
  const {
    body: { like, unlike },
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review update error, invalid _id')
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
    body: { values, href, itemName, populateItem, },
    appName,
    params: { _id },
    user,
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review update error, invalid _id')
  const oldReview = await Review.findOne({ _id, appName, user })
  const hasNewRating = oldReview.values.rating !== values.rating ? true : false
  const published = hasNewRating && values.rating < 3 ? false : true

  const review = populateItem ? await Review.findOneAndUpdate(
    { _id, appName, user },
    { $set: {
      values,
      published
    }},
    { new: true }
  )
  .populate({ path: 'user', select: 'values.firstName values.lastName _id' })
  .populate({ path: 'item', select: '_id values.name values.title values.image' })
  :
  await Review.findOneAndUpdate(
    { _id, appName, user },
    { $set: {
      values,
      published
    }},
    { new: true }
  )
  .populate({ path: 'user', select: 'values.firstName values.lastName _id' })

  if (!review) throw Error('Review update error')
  if (review.published && hasNewRating) {
    const { blog, product } = await handleItem({
      item: populateItem ? review.item._id : review.item,
      kind: review.kind
    })
    res.send({
      blog,
      product,
      review,
    })
  } else {
    res.send({ review })
  }
  await sendGmail({
    appName,
    adminSubject: `Review Updated for ${review.kind} ${itemName}!`,
    adminBody: `
      <p>${user.values.firstName} ${user.values.lastName} just updated their review for <a href="${href}#${review._id}">${itemName}</a>!</p>
      <br/>
      <h3>${user.values.firstName}'s previous review:</h3>
      <div>Stars: ${oldReview.values.rating}</div>
      <div>Review: ${oldReview.values.text}</div>
      <br/>
      <h3>${user.values.firstName}'s updated review</h3>
      <div>Stars: ${values.rating}</div>
      <div class="gutterBottom">Review: ${values.text}</div>
    `
  })
}








export const updatePublish = async (req, res) => {
  const {
    body: { published },
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review update error, invalid _id')
  const review = await Review.findOneAndUpdate(
    { _id, appName },
    { $set: { published }},
    { new: true }
  )
  .populate({ path: 'user', select: 'values.firstName values.lastName _id' })
  .populate({ path: 'item', select: '_id values.name values.title values.image' })
  if (!review) throw Error('Review update error')

  const { blog, product } = await handleItem({ item: review.item._id, kind: review.kind })
  res.send({
    blog,
    product,
    review,
  })
}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id },
    user,
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review remove error, invalid _id')
  const review = await Review.findOneAndRemove({ _id, appName, user })
  if (!review) throw Error('Review remove error, review not found')

  const { blog, product } = await handleItem({ item: review.item, kind: review.kind })
  res.send({
    blog,
    product,
    review,
  })
  await Comment.deleteMany({ review: review._id })
}






export const adminRemove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review remove error, invalid _id')
  const review = await Review.findOneAndRemove({ _id, appName })
  if (!review) throw Error('Review remove error, review not found')

  const { blog, product } = await handleItem({ item: review.item, kind: review.kind })
  res.send({
    blog,
    product,
    review,
  })
  await Comment.deleteMany({ review: review._id })
}
