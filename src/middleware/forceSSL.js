const forceSSL = (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    const sslUrl = ['https://', req.hostname, req.url].join('')
    return res.redirect(sslUrl)
  }
  return next()
}

export default forceSSL
