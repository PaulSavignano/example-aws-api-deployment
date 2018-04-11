import crypto from 'crypto'

import AccessToken from '../models/AccessToken'
import RefreshToken from '../models/RefreshToken'

const createTokens = async (user, appName) => {
  try {
    const newAccessToken = await crypto.randomBytes(30).toString('hex')
    const newRefreshToken = await crypto.randomBytes(30).toString('hex')
    await new AccessToken({
      accessToken: newAccessToken,
      appName,
      user: user._id
    }).save()
    await new RefreshToken({
      refreshToken: newRefreshToken,
      appName,
      user: user._id
    }).save()
    return {
      newAccessToken,
      newRefreshToken
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export default createTokens
