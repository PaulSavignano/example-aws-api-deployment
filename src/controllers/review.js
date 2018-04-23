import { ObjectID } from 'mongodb'

import Blog from '../models/Blog'
import Product from '../models/Product'
import Review from '../models/Review'
import sendGmail from '../utils/sendGmail'
import getQuery from '../utils/getQuery'
import getCursorSort from '../utils/getCursorSort'



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

  res.send({ review })

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
    published: true,
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
      userId,
    },
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
    userId,
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
    body: { values, href, itemName },
    appName,
    params: { _id },
    user,
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Review update error, invalid _id')
  const oldReview = await Review.findOne({ _id, appName })
  const hasNewRating = oldReview.values.rating !== values.rating ? true : false

  const review = await Review.findOneAndUpdate(
    { _id, appName },
    { $set: { values }},
    { new: true }
  )
  .populate({ path: 'user', select: 'values.firstName values.lastName _id' })
  .populate({ path: 'item', select: '_id values.name values.title values.image' })
  if (!review) throw Error('Review update error')

  if (review.published && hasNewRating) {
    if (review.kind === 'Blog') {
      const blog = await Blog.findOne({ _id: review.item })
      const stars = blog.rating.stars > review.values.rating ? blog.rating.stars - review.values.rating : blog.rating.stars + review.values.rating
      const avg = (blog.rating.reviews / stars).toFixed(1)
      blog.rating.avg = avg
      blog.rating.stars = stars
      await blog.save()
      res.send({
        blog,
        review,
      })
    }
    if (oldReview.kind === 'Product') {
      const product = await Product.findOne({ _id: oldReview.item })
      const stars = product.rating.stars > review.values.rating ? product.rating.stars - review.values.rating : product.rating.stars + review.values.rating
      const avg = (product.rating.reviews / stars).toFixed(1)
      product.rating.avg = avg
      product.rating.stars = stars
      await product.save()
      res.send({
        product,
        review,
      })
    }
  }

  await sendGmail({
    appName,
    adminSubject: `Review Updated for ${itemName}!`,
    adminBody: `
      <p>${user.values.firstName} ${user.values.lastName} just updated their review for <a href="${href}#${review._id}">${itemName}</a>!</p>
      <br/>
      <div style="text-decoration: underline">${user.values.firstName}'s previous review</div>
      <div>Stars: ${oldReview.values.rating}</div>
      <div>Review: ${oldReview.values.text}</div>
      <br/>
      <div style="text-decoration: underline">${user.values.firstName}'s updated review</div>
      <div>Stars: ${values.rating}</div>
      <div>Review: ${values.text}</div>
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

  if (review.kind === 'Blog') {
    const blog = await Blog.findOne({ _id: review.item })
    const stars = published ? blog.rating.stars + review.values.rating : blog.rating.stars - review.values.rating
    const reviews = published ? blog.rating.reviews + 1 : blog.rating.reviews > 0 ? blog.rating.reviews - 1 : 0
    const avg = (stars / reviews).toFixed(1)
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
    const avg = (stars / reviews).toFixed(1)
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

  if (review.kind === 'Blog') {
    const blog = await Blog.findOne({ _id: review.item })
    const stars = review.published ? blog.rating.stars - review.values.rating : blog.rating.stars
    const reviews = review.published && blog.rating.reviews > 0 ? blog.rating.reviews - 1 : blog.rating.reviews
    const avg = review.published ? (stars / reviews).toFixed(1) : blog.rating.avg
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
    const stars = review.published ? product.rating.stars - review.values.rating : product.rating.stars
    const reviews = review.published && product.rating.reviews > 0 ? product.rating.reviews - 1 : product.rating.reviews
    const avg = review.published ? (stars / reviews).toFixed(1) : product.rating.avg
    const rating = { avg, reviews, stars }
    product.rating = rating
    await product.save()
    return res.send({
      product,
      review,
    })
  }


  return res.send(review._id)
}
