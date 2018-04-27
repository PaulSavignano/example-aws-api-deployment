const catchErrors = (fn) => (req, res, next) => {
  return fn(req, res, next)
  .catch(next)
}

export default catchErrors
