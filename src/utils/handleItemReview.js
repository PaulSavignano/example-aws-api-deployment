import Blog from '../models/Blog'
import Product from '../models/Product'

const handleItemReview = async ({
  blog,
  previousReview,
  product,
  review,
}) => {
  if (previousReview.kind === 'Blog') {
    const stars = previousReview.published && blog.rating.stars > previousReview.values.rating ? blog.rating.stars - previousReview.values.rating : blog.rating.stars + previousReview.values.rating
    const reviews = previousReview.published && blog.rating.reviews > previousReview.values.rating && blog.rating.reviews > 0 ? blog.rating.reviews - 1 : 0
    const avg = previousReview.published ? (reviews / stars).toFixed(1) : previousReview.rating.avg
    const rating = { avg, reviews, stars }
    blog.rating = rating
    await blog.save()
    return res.send({
      blog,
      review: previousReview,
    })
  }
  if (previousReview.kind === 'Product') {
    const product = await Product.findOne({ _id: previousReview.item })
    const stars = previousReview.published && product.rating.stars > previousReview.values.rating ? product.rating.stars - previousReview.values.rating : product.rating.stars + previousReview.values.rating
    const reviews = previousReview.published && product.rating.reviews > previousReview.values.rating && product.rating.reviews > 0 ? product.rating.reviews - 1 : 0
    const avg = previousReview.published ? (stars / reviews).toFixed(1) : previousReview.rating.avg
    const rating = { avg, reviews, stars }
    product.rating = rating
    await product.save()
    return res.send({
      product,
      review: previousReview,
    })
  }
}
