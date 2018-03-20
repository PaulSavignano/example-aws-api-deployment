const setBrand = (req, res, next) => {
  const { appName } = req.params
  if (!appName) {
    next(Error('Access denied, brand was not specified'))
  }
  req.appName = appName
  next()
}

export default setBrand
