class ErrorObject extends Error {
  constructor(name = '', ...params) {
    super(...params)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ErrorObject);
    }
    this.name = Object.keys(name)[0];
    this.message = Object.values(name)[0]
    this.status = Object.values(name)[1]
  }
}

export default ErrorObject
