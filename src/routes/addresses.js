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


addresses.post('/:brandName', authenticate([ 'admin', 'owner', 'user' ]), catchErrors(add))
addresses.post('/:brandName/admin/:userId', authenticate([ 'owner' ]), catchErrors(adminAdd))

addresses.get('/:brandName', authenticate(['user']), catchErrors(get))
addresses.get('/:brandName/admin', authenticate(['admin', 'owner']), catchErrors(adminGet))

addresses.patch('/:brandName/:_id', authenticate([ 'admin', 'owner', 'user' ]), catchErrors(update))
addresses.patch('/:brandName/admin/:_id', authenticate([ 'owner' ]), catchErrors(adminUpdate))
addresses.delete('/:brandName/:_id', authenticate([ 'admin', 'owner', 'user' ]), catchErrors(remove))
addresses.delete('/:brandName/admin/:_id', authenticate([ 'owner' ]), catchErrors(adminRemove))

export default addresses
