import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  adminAdd,
  adminUpdate,
  adminRemove,
  get,
  adminGet,
  remove,
  update
} from '../controllers/address'

const addresses = express.Router()


addresses.post('/', authenticate([ 'admin', 'owner', 'user' ]), catchErrors(add))
addresses.post('/admin/:userId', authenticate([ 'owner' ]), catchErrors(adminAdd))

addresses.get('/', authenticate(['user']), catchErrors(get))
addresses.get('/admin', authenticate(['admin', 'owner']), catchErrors(adminGet))

addresses.patch('/:_id', authenticate([ 'admin', 'owner', 'user' ]), catchErrors(update))
addresses.patch('/admin/:_id', authenticate([ 'owner' ]), catchErrors(adminUpdate))
addresses.delete('/:_id', authenticate([ 'admin', 'owner', 'user' ]), catchErrors(remove))
addresses.delete('/admin/:_id', authenticate([ 'owner' ]), catchErrors(adminRemove))

export default addresses
