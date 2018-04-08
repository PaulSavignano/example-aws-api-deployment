import Blog from '../models/Blog'
import Component from '../models/Component'
import Product from '../models/Product'

export const search = async (req, res) => {
  const {
    appName,
    query: { q, limit, lastBlogId, lastComponentId, lastProductId }
  } = req

  const lastBlogIdQuery = lastBlogId && { _id: { $gt: lastBlogId }}
  const blogs = await Blog.find({
    appName,
    ...lastBlogIdQuery,
    $text: { $search: q }
  }, {
    score: { $meta: 'textScore' }
  })
  .limit(parseInt(limit))

  const lastComponentIdQuery = lastComponentId && { _id: { $gt: lastComponentId }}
  const components = await Component.find({
    appName,
    ...lastComponentIdQuery,
    $text: { $search: q },
    kind: { $ne: 'hero' }
  }, {
    score: { $meta: 'textScore' }
  })
  .limit(parseInt(limit))

  const lastProductIdQuery = lastProductId && { _id: { $gt: lastProductId }}
  const products = await Product.find({
    appName,
    ...lastProductIdQuery,
    $text: { $search: q }
  }, {
    score: { $meta: 'textScore' }
  })
  .limit(parseInt(limit))

  res.send({ blogs, components, products })
}
