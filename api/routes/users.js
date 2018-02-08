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
  adminAdd,
  adminRemove,
  adminUpdate,
} from '../controllers/userAdmin'

const users = express.Router()

users.post('/:brandName', catchErrors(add))
users.get('/:brandName', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(get))
users.patch('/:brandName', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(update))
users.delete('/:brandName', authenticate([ 'user', 'admin', 'owner' ]), catchErrors(remove))
users.post('/:brandName/signin', catchErrors(signin))
users.post('/:brandName/recovery', catchErrors(recovery))
users.post('/:brandName/reset/:resetToken', catchErrors(reset))
users.post('/:brandName/contact', catchErrors(contact))
users.post('/:brandName/admin', authenticate([ 'owner' ]), catchErrors(adminAdd))
users.patch('/:brandName/admin/:_id', authenticate([ 'owner']), catchErrors(adminUpdate))
users.delete('/:brandName/admin/:_id', authenticate([ 'owner' ]), catchErrors(adminRemove))

export default users
