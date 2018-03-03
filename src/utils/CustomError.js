class CustomError extends Error {
  constructor(errorObj = {}, ...params) {
    super(...params)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
    this.date = new Date()
    this.field = errorObj.field
    this.message = errorObj.message
    this.name = errorObj.name || 'Error'
    this.statusCode = errorObj.statusCode
  }
}

export default CustomError
