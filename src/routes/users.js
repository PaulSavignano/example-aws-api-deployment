import express from 'express'

import catchErrors from '../utils/catchErrors'

import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  update,
  remove,
  signin,
  recovery,
  reset,
  signout,
  contact,
  requestEstimate
} from '../controllers/user'
import {
  adminGet,
  adminAdd,
  adminRemove,
  adminUpdateValues,
  adminUpdateRoles
} from '../controllers/userAdmin'

const users = express.Router()


users.post('/', catchErrors(add))
users.get('/', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(get))
users.get('/admin', authenticate([ 'admin', 'owner' ]), catchErrors(adminGet))
users.patch('/', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(update))
users.delete('/', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(remove))
users.post('/signin', catchErrors(signin))
users.post('/recovery', catchErrors(recovery))
users.post('/reset/:resetToken', catchErrors(reset))
users.post('/contact', catchErrors(contact))
users.post('/admin', authenticate([ 'owner' ]), catchErrors(adminAdd))
users.patch('/admin/update-values/:_id', authenticate([ 'owner']), catchErrors(adminUpdateValues))
users.patch('/admin/update-roles/:_id', authenticate([ 'owner']), catchErrors(adminUpdateValues))
users.delete('/admin/:_id', authenticate([ 'owner' ]), catchErrors(adminRemove))

export default users
