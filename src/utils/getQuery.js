const parseBoolean = (bool) => bool === 'true' ? true : false


const getSortQuery = ({
  lastId,
  lastPrice,
  lastRating,
  lastTotal,
  sort
}) => {
  if (lastId && sort) {
    if (sort === 'created-desc') return { _id: { $lt: lastId }}
    if (sort === 'created-asc') return { _id: { $gt: lastId }}
    if (sort === 'price-desc' && lastPrice) return {
      $or: [{
        'values.price': { $lt: lastPrice }
      }, {
        'values.price': lastPrice,
        _id: { $lt: lastId }
      }]
    }
    if (sort === 'rating-desc' && lastRating) return {
      $or: [{
        'values.rating': { $lt: lastRating }
      }, {
        'values.rating': lastRating,
        _id: { $lt: lastId }
      }]
    }
    if (sort === 'total-desc' && lastTotal) return {
      $or: [{
        total: { $lt: lastTotal }
      }, {
        total: lastTotal,
        _id: { $lt: lastId }
      }]
    }
  }
  if (lastId) return { _id: { $lt: lastId }}
  return {}
}



const getQuery = ({
  _id,
  appName,
  item,
  kind,
  lastId,
  lastPrice,
  lastRating,
  lastTotal,
  published,
  shipped,
  sort,
  userId,
}) => {
  const _idQuery = _id && { _id }
  const itemQuery = item && { item }
  const kindQuery = kind && { kind }
  const lastQuery = getSortQuery({
    lastId,
    lastPrice: parseInt(lastPrice),
    lastRating: parseInt(lastRating),
    lastTotal: parseInt(lastTotal),
    sort,
  })
  const publishedQuery = published && { published: parseBoolean(published) }
  const shippedQuery = shipped && { shipped: parseBoolean(shipped) }
  const userIdQuery = userId && { user: userId }
  const query = {
    appName,
    ..._idQuery,
    ...itemQuery,
    ...kindQuery,
    ...lastQuery,
    ...publishedQuery,
    ...shippedQuery,
    ...userIdQuery,
  }
  return query
}

export default getQuery
