const setBrand = (req, res, next) => {
  const { appName } = req.params
  if (!appName) {
    next(Error('Access denied, appName was not provided'))
  }
  req.appName = appName
  return next()
}

export default setBrand
