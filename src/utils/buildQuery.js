const buildQuery = ({
  _id,
  itemQuery
}) => {
  const _idQuery = _id && { _id }
  const itemQuery = item && { item }
  const kindQuery = kind && { kind }

  const lastIdQuery = lastId && sort === 'date-desc-rank' ? { _id: { $lt: lastId }} : sort === 'date-asc-rank' ? { _id: { $gt: lastId }} : null
  const sort = sort && sort === 'date-desc-rank' ? { createdAt: -1 } : sort === 'date-desc-rank' ? { createdAt: 1 } : sort === 'review-rank' ? { 'values.rating': 1 } : null

  const limitInt = limit ? parseInt(limit) : 3
  const publishedQuery = published === 'true' ? { published: true } : published === 'false' ? { published: false } : null
  const userIdQuery = userId && { user: userId }
  const query = {
    appName,
    ..._idQuery,
    ...itemQuery,
    ...kindQuery,
    ...lastIdQuery,
    ...publishedQuery,
    ...userIdQuery,
  }
}
