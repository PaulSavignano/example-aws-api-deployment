import crypto from 'crypto'

import AccessToken from '../models/AccessToken'
import RefreshToken from '../models/RefreshToken'

const createTokens = async (user, appName) => {
  try {
    const newAccessTokenPromise = crypto.randomBytes(30).toString('hex')
    const newRefreshTokenPromise = crypto.randomBytes(30).toString('hex')
    const [ newAccessToken, newRefreshToken ] = await Promise.all([ newAccessTokenPromise, newRefreshTokenPromise ])
    const accessTokenPromise = new AccessToken({
      accessToken: newAccessToken,
      appName,
      user: user._id
    }).save()
    const refreshTokenPromise = new RefreshToken({
      refreshToken: newRefreshToken,
      appName,
      user: user._id
    }).save()
    await Promise.all([ accessTokenPromise, refreshTokenPromise ])
    return {
      newAccessToken,
      newRefreshToken
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export default createTokens
