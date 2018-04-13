import express from 'express'
import RateLimit from 'express-rate-limit'

import catchErrors from '../utils/catchErrors'

import authenticate from '../middleware/authenticate'
import {
  add,
  contact,
  get,
  recovery,
  remove,
  reset,
  signin,
  signout,
  update,
  updateAddresses,
} from '../controllers/user'
import {
  adminAdd,
  adminGet,
  adminRemove,
  adminUpdateAddresses,
  adminUpdateRoles,
  adminUpdateValues,
} from '../controllers/userAdmin'

const users = express.Router()

const limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 100, // limit each IP to 100 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
})

users.delete('/', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(remove))
users.delete('/admin/:_id', authenticate([ 'owner' ]), catchErrors(adminRemove))
users.get('/', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(get))
users.get('/admin', authenticate([ 'owner' ]), catchErrors(adminGet))
users.patch('/', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(update))
users.patch('/admin/update-addresses/:_id', authenticate(['owner']), catchErrors(adminUpdateAddresses))
users.patch('/admin/update-roles/:_id', authenticate(['owner']), catchErrors(adminUpdateRoles))
users.patch('/admin/update-values/:_id', authenticate(['owner']), catchErrors(adminUpdateValues))
users.patch('/update-addresses', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(updateAddresses))
users.post('/', catchErrors(add))
users.post('/admin', authenticate([ 'owner' ]), catchErrors(adminAdd))
users.post('/contact', catchErrors(contact))
users.post('/recovery', limiter, catchErrors(recovery))
users.post('/reset/:resetToken', limiter, catchErrors(reset))
users.post('/signin', limiter, catchErrors(signin))
users.post('/signout', limiter, authenticate([ 'user', 'admin', 'owner' ]), catchErrors(signout))

export default users
