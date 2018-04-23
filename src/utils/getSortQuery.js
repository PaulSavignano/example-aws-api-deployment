const getSortQuery = ({
  lastId,
  lastRating,
  sort
}) => {
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

export default getSortQuery
