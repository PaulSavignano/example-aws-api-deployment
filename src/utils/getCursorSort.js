const getCursorSort = ({ sort, rating }) => {
  if (sort) {
     if (sort === 'created-asc') return { _id: 1 }
     if (sort === 'created-desc') return { _id: -1 }
     if (sort === 'price-desc') return { 'values.price': -1, _id: -1 }
     if (sort === 'rating-desc') return { [`${rating}`]: -1, _id: -1 }
     if (sort === 'total-desc') return { total: -1, _id: -1 }
  }
  return { _id: -1 }
}

export default getCursorSort
