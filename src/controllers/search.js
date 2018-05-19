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
  .limit(parseInt(limit / 3))

  const lastComponentIdQuery = lastComponentId && { _id: { $gt: lastComponentId }}
  const componentsPromise = Component.find({
    appName,
    ...lastComponentIdQuery,
    $text: { $search: q },
    kind: { $ne: 'hero' }
  }, {
    score: { $meta: 'textScore' }
  })
  .limit(parseInt(limit / 3))

  const lastProductIdQuery = lastProductId && { _id: { $gt: lastProductId }}
  const productsPromise = Product.find({
    appName,
    published: true,
    ...lastProductIdQuery,
    $text: { $search: q }
  }, {
    score: { $meta: 'textScore' }
  })
  .limit(parseInt(limit / 3))

  const results = await Promise.all([ blogsPromise, componentsPromise, productsPromise ])

  const [ blogs, components, products ] = results

  res.send({ blogs, components, products })
}
