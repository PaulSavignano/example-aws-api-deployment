import AccessToken from '../models/AccessToken'
import RefreshToken from '../models/RefreshToken'
import createTokens from '../utils/createTokens'
import User from '../models/User'

const hasRoles = (roles, requiredRoles) => {
  return roles.some(r => requiredRoles.indexOf(r) >= 0)
}

const authenticate = (requiredRoles) => {
  return async (req, res, next) => {
    const accessToken = req.headers['x-access-token']
    if (accessToken) {
      try {
        const aToken = await AccessToken.findOne({ accessToken }).populate('user')
        if (!hasRoles(aToken.user.roles, requiredRoles)) throw Error('Access denied')
        req.user = aToken.user
        next()
      } catch (error) {
        const refreshToken = req.headers['x-refresh-token']
        if (refreshToken) {
          try {
            const { brandName } = req.params
            const rToken = await RefreshToken.findOne({ refreshToken }).populate('user')
            if (!hasRoles(rToken.user.roles, requiredRoles)) throw Error('Access denied')
            const { newAccessToken, newRefreshToken } = await createTokens(rToken.user, brandName)
            if (newAccessToken && newRefreshToken) {
              req.user = rToken.user
              res.set('x-access-token', newAccessToken)
              res.set('x-refresh-token', newRefreshToken)
            }
            next()
          } catch (error) {
            next(error)
          }
        }
      }
    } else {
      next(Error('Access denied'))
    }
  }
}

export default authenticate
