const notFound = (req, res, next) => {
  const err = new Error(`${req.originalUrl} not found`)
  err.status = 404
  next(err)
}

export default notFound
