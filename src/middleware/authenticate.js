import AccessToken from '../models/AccessToken'
import RefreshToken from '../models/RefreshToken'
import createTokens from '../utils/createTokens'

const hasRoles = (roles, requiredRoles) => roles.some(r => requiredRoles.indexOf(r) !== -1)

const authenticate = (requiredRoles) => async (req, res, next) => {
  const accessToken = req.headers['x-access-token']
  if (accessToken) {
    try {
      const aToken = await AccessToken.findOne({ accessToken }).populate('user')
      if (!hasRoles(aToken.user.roles, requiredRoles)) throw Error('Access denied')
      req.user = aToken.user
      return next()
    } catch (error) {
      const refreshToken = req.headers['x-refresh-token']
      if (refreshToken) {
        try {
          const rToken = await RefreshToken.findOne({ refreshToken }).populate('user')
          if (!hasRoles(rToken.user.roles, requiredRoles)) throw Error('Access denied')
          const { newAccessToken, newRefreshToken } = await createTokens(rToken.user, req.appName)
          if (newAccessToken && newRefreshToken) {
            req.user = rToken.user
            res.set('x-access-token', newAccessToken)
            res.set('x-refresh-token', newRefreshToken)
          }
          return next()
        } catch (error) {
          return next(error)
        }
      }
    }
  } else {
    next(Error('Access denied'))
  }
}

export default authenticate
