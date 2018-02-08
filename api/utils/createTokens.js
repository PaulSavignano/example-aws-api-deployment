import AccessToken from '../models/AccessToken'
import RefreshToken from '../models/RefreshToken'
import createToken from '../utils/createToken'

const createTokens = async (user, brandName) => {
  try {
    const newAccessToken = await createToken()
    const newRefreshToken = await createToken()
    await new AccessToken({
      accessToken: newAccessToken,
      brandName,
      user: user._id
    }).save()
    await new RefreshToken({
      refreshToken: newRefreshToken,
      brandName,
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
