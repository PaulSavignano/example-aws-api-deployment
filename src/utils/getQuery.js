const getSortQuery = ({
  lastId,
  lastRating,
  lastTotal,
  sort
}) => {
  if (lastId && sort) {
    if (sort === 'date-desc') return { _id: { $lt: lastId }}
    if (sort === 'date-asc') return { _id: { $gt: lastId }}
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
  lastRating,
  lastTotal,
  shipped,
  published,
  sort,
  userId,
}) => {
  console.log('lastTotal', lastTotal)
  const _idQuery = _id && { _id }
  const itemQuery = item && { item }
  const kindQuery = kind && { kind }
  const lastQuery = getSortQuery({ lastId, lastRating: parseInt(lastRating), sort, lastTotal: parseInt(lastTotal) })
  console.log('lastQuery', lastQuery)
  const publishedQuery = published === 'true' ? { published: true } : published === 'false' ? { published: false } : null
  const shippedQuery = shipped === 'true' ? { shipped: true } : shipped === 'false' ? { shipped: false } : null
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
