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
    query: {
      _id,
      item,
      kind,
      lastId,
      limit,
      userId,
    },
  } = req
  const _idQuery = _id && { _id }
  const itemQuery = item && { item }
  const kindQuery = kind && { kind }
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const userIdQuery = userId && { user: userId }
  const limitInt = limit ? parseInt(limit) : 3
  const query = {
    appName,
    published: true,
    ..._idQuery,
    ...itemQuery,
    ...kindQuery,
    ...lastIdQuery,
    ...userIdQuery,
  }
  if (item) {
    const reviews = await Review.find(query)
    .sort({ createdAt: -1 })
    .limit(limitInt)
    return res.send(reviews)
  }
  const reviews = await Review.find(query)
  .populate({ path: 'item', select: '_id values.name values.title values.image' })
  .sort({ createdAt: -1 })
  .limit(limitInt)
  console.log('reviews get', reviews)
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
      limit,
      published,
      userId,
    },
  } = req
  const _idQuery = _id && { _id }
  const itemQuery = item && { item }
  const kindQuery = kind && { kind }
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const userQuery = userId && { user: req.user._id }
  const limitInt = limit ? parseInt(limit) : 3
  const publishedQuery = published === 'true' ? { published: true } : published === 'false' ? { published: false } : null
  const query = {
    appName,
    ..._idQuery,
    ...itemQuery,
    ...kindQuery,
    ...lastIdQuery,
    ...userQuery,
    ...publishedQuery,
  }
  if (item) {
    const reviews = await Review.find(query)
    .sort({ createdAt: -1 })
    .limit(limitInt)
    return res.send(reviews)
  }
  const reviews = await Review.find(query)
  .populate({ path: 'item', select: '_id values.name values.title values.image' })
  .sort({ createdAt: -1 })
  .limit(limitInt)
  return res.send(reviews)
}



 const buildLastQuery = ({ lastId, lastRating, sort }) => {
   if (lastId && sort) {
     if (sort === 'date-desc-rank') return { _id: { $lt: lastId }}
     if (sort === 'date-asc-rank') return { _id: { $gt: lastId }}
     if (sort === 'rating-desc' && lastRating) return {
       $or: [{
         'values.rating': { $lt: lastRating }
       }, {
         'values.rating': lastRating,
         _id: { $lt: lastId }
       }]
     }
   }
   if (lastId) return { _id: { $lt: lastId }}
   return {}
 }

 const buildCursorSort = ({ sort }) => {
   if (sort) {
      if (sort === 'date-desc-rank') return { _id: -1 }
      if (sort === 'date-asc-rank') return { _id: 1 }
      if (sort === 'rating-desc') return { 'values.rating': -1, _id: -1 }
   }
   return { _id: -1 }
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
  const _idQuery = _id && { _id }
  const itemQuery = item && { item }
  const kindQuery = kind && { kind }

  const lastQuery = buildLastQuery({ lastId, lastRating: parseInt(lastRating), sort })
  console.log('lastQuery', lastQuery)

  const cursorSort = buildCursorSort({ sort })
  console.log('cursorSort', cursorSort)

  const limitInt = limit ? parseInt(limit) : 3
  const publishedQuery = published === 'true' ? { published: true } : published === 'false' ? { published: false } : null
  const userIdQuery = userId && { user: userId }
  const query = {
    appName,
    ..._idQuery,
    ...itemQuery,
    ...kindQuery,
    ...lastQuery,
    ...publishedQuery,
    ...userIdQuery,
  }
  console.log('query', query)
  if (item) {
    const reviews = await Review.find(query)
    .sort({ ...cursorSort })
    .limit(limitInt)
    return res.send(reviews)
  }
  const reviews = await Review.find(query)
  .populate({ path: 'item', select: '_id values.name values.title values.image' })
  .sort({ ...cursorSort })
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
    body: { values, href, itemName },
    appName,
    params: { _id },
    user,
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review update error, invalid _id')
  const prevReview = await Review.findOne({ _id, appName })
  const hasNewRating = prevReview.values.rating !== values.rating ? true : false

  if (hasNewRating && prevReview.kind === 'Blog') {
    const blog = await Blog.findOne({ _id: prevReview.item })
    const stars = prevReview.published && blog.rating.stars > prevReview.values.rating ? blog.rating.stars - prevReview.values.rating : blog.rating.stars + prevReview.values.rating
    const reviews = prevReview.published && blog.rating.reviews > prevReview.values.rating && blog.rating.reviews > 0 ? blog.rating.reviews - 1 : 0
    const avg = prevReview.published ? (reviews / stars).toFixed(1) : prevReview.rating.avg
    const rating = { avg, reviews, stars }
    blog.rating = rating
    await blog.save()
    return res.send({
      blog,
      review: prevReview,
    })
  }
  if (prevReview.kind === 'Product') {
    const product = await Product.findOne({ _id: prevReview.item })
    const stars = prevReview.published && product.rating.stars > prevReview.values.rating ? product.rating.stars - prevReview.values.rating : product.rating.stars + prevReview.values.rating
    const reviews = prevReview.published && product.rating.reviews > prevReview.values.rating && product.rating.reviews > 0 ? product.rating.reviews - 1 : 0
    const avg = prevReview.published ? (reviews / stars).toFixed(1) : prevReview.rating.avg
    const rating = { avg, reviews, stars }
    product.rating = rating
    await product.save()
    return res.send({
      product,
      review: prevReview,
    })
  }

  const review = await Review.findOneAndUpdate(
    { _id, appName },
    { $set: { values }},
    { new: true }
  )
  .populate({ path: 'user', select: 'values.firstName values.lastName _id' })
  .populate({ path: 'item', select: '_id values.name values.title values.image' })
  if (!review) throw Error('Review update error')

  res.send({ review })
  await sendGmail({
    appName,
    adminSubject: `Review Updated for ${itemName}!`,
    adminBody: `
      <p>${user.values.firstName} ${user.values.lastName} just updated their review for <a href="${href}#${review._id}">${itemName}</a>!</p>
      <br/>
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

  if (review.kind === 'Blog') {
    const blog = await Blog.findOne({ _id: review.item })
    const stars = published ? blog.rating.stars + review.values.rating : blog.rating.stars - review.values.rating
    const reviews = published ? blog.rating.reviews + 1 : blog.rating.reviews > 0 ? blog.rating.reviews - 1 : 0
    const avg = (reviews / stars).toFixed(1)
    const rating = { avg, reviews, stars }
    blog.rating = rating
    await blog.save()
    return res.send({
      blog,
      review,
    })
  }
  if (review.kind === 'Product') {
    const product = await Product.findOne({ _id: review.item })
    const stars = published ? product.rating.stars + review.values.rating : product.rating.stars - review.values.rating
    const reviews = published ? product.rating.reviews + 1 : product.rating.reviews > 0 ? product.rating.reviews - 1 : 0
    const avg = (reviews / stars).toFixed(1)
    const rating = { avg, reviews, stars }
    product.rating = rating
    await product.save()
    return res.send({
      product,
      review,
    })
  }

}






export const remove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review remove error, invalid _id')
  const review = await Review.findOneAndRemove({ _id, appName })
  if (!review) throw Error('Review remove error, review not found')
  return res.send(review._id)
}
