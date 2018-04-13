import AccessToken from '../models/AccessToken'
import RefreshToken from '../models/RefreshToken'
import createTokens from '../utils/createTokens'

const handleAuth = (roles, requiredRoles) => roles.some(r => requiredRoles.indexOf(r) !== -1)

const authenticate = (requiredRoles) => async (req, res, next) => {
  const accessToken = req.headers['x-access-token']
  const refreshToken = req.headers['x-refresh-token']
  try {
    if (accessToken) {
      const aToken = await AccessToken.findOne({ accessToken }).populate('user')
      const aTokenHasRoles = handleAuth(aToken.user.roles, requiredRoles)
      if (!aTokenHasRoles) throw Error('Access denied')
      req.user = aToken.user
      req.appName = aToken.user.appName
      return next()
    } else if (refreshToken) {
      const rToken = await RefreshToken.findOne({ refreshToken }).populate('user')
      const rTokenHasRoles = handleAuth(rToken.user.roles, requiredRoles)
      if (!rTokenHasRoles) throw Error('Access denied')
      const { newAccessToken, newRefreshToken } = await createTokens(rToken.user, req.appName)
      if (newAccessToken && newRefreshToken) {
        req.user = rToken.user
        req.appName = rToken.user.appName
        res.set('x-access-token', newAccessToken)
        res.set('x-refresh-token', newRefreshToken)
      }
      return next()
    } else {
      return next(Error('Access denied'))
    }
  } catch (error) {
    return next(error)
  }
}

export default authenticate
