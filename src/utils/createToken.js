import crypto from 'crypto'

const createToken = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (error, buf) => {
      if (error) return reject(error)
      resolve(buf.toString('hex'));
    })
  })
}

export default createToken
