import express from 'express'
import RateLimit from 'express-rate-limit'

import catchErrors from '../utils/catchErrors'

import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  update,
  updateAddresses,
  remove,
  signin,
  recovery,
  reset,
  signout,
  contact,
} from '../controllers/user'
import {
  adminGet,
  adminAdd,
  adminRemove,
  adminUpdateValues,
  adminUpdateRoles,
  adminUpdateAddresses,
} from '../controllers/userAdmin'

const users = express.Router()

const limiter = new RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  max: 100, // limit each IP to 100 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
})


users.post('/', catchErrors(add))
users.get('/', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(get))
users.get('/admin', authenticate([ 'owner' ]), catchErrors(adminGet))
users.patch('/', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(update))
users.patch('/update-addresses', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(updateAddresses))
users.delete('/', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(remove))
users.post('/signout', limiter, authenticate([ 'user', 'admin', 'owner' ]), catchErrors(signout))
users.post('/signin', limiter, catchErrors(signin))
users.post('/recovery', limiter, catchErrors(recovery))
users.post('/reset/:resetToken', limiter, catchErrors(reset))
users.post('/contact', catchErrors(contact))
users.post('/admin', authenticate([ 'owner' ]), catchErrors(adminAdd))
users.patch('/admin/update-values/:_id', authenticate([ 'owner']), catchErrors(adminUpdateValues))
users.patch('/admin/update-roles/:_id', authenticate([ 'owner']), catchErrors(adminUpdateRoles))
users.patch('/admin/update-addresses/:_id', authenticate([ 'owner' ]), catchErrors(adminUpdateAddresses))
users.delete('/admin/:_id', authenticate([ 'owner' ]), catchErrors(adminRemove))


export default users
