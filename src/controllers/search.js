import Blog from '../models/Blog'
import Component from '../models/Component'
import Product from '../models/Product'




export const search = async (req, res) => {
  const {
    appName,
    query: { q, limit, lastBlogId, lastComponentId, lastProductId }
  } = req

  const lastBlogIdQuery = lastBlogId && { _id: { $gt: lastBlogId }}
  const blogsPromise = Blog.find({
    appName,
    published: true,
    ...lastBlogIdQuery,
    $text: { $search: q }
  }, {
    score: { $meta: 'textScore' }
  })
  .limit(parseInt(limit))

  const lastComponentIdQuery = lastComponentId && { _id: { $gt: lastComponentId }}
  const componentsPromise = Component.find({
    appName,
    ...lastComponentIdQuery,
    $text: { $search: q },
    kind: { $ne: 'hero' }
  }, {
    score: { $meta: 'textScore' }
  })
  .limit(parseInt(limit))

  const lastProductIdQuery = lastProductId && { _id: { $gt: lastProductId }}
  const productsPromise = Product.find({
    appName,
    published: true,
    ...lastProductIdQuery,
    $text: { $search: q }
  }, {
    score: { $meta: 'textScore' }
  })
  .limit(parseInt(limit))

  const [ blogs, components, products ] = await Promise.all([ blogsPromise, componentsPromise, productsPromise ])

  res.send({ blogs, components, products })
}
