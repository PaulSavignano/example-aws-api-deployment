import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  adminAdd,
  adminUpdate,
  adminRemove,
  getUser,
  getId,
  adminGetUser,
  adminGetId,
  adminGetAll,
  remove,
  update
} from '../controllers/address'

const addresses = express.Router()


addresses.post('/:brandName', authenticate([ 'admin', 'owner', 'user' ]), catchErrors(add))
addresses.post('/:brandName/admin/:userId', authenticate([ 'owner' ]), catchErrors(adminAdd))

addresses.get('/:brandName/user', authenticate(['user']), catchErrors(getUser))
addresses.get('/:brandName/user-id/:_id', authenticate(['user']), catchErrors(getId))
addresses.get('/:brandName/admin-user/:userId', authenticate(['admin', 'owner']), catchErrors(adminGetUser))
addresses.get('/:brandName/admin-id/:_id', authenticate(['admin', 'owner']), catchErrors(adminGetId))
addresses.get('/:brandName/admin-all/:page', authenticate(['admin', 'owner']), catchErrors(adminGetAll))

addresses.patch('/:brandName/:_id', authenticate([ 'admin', 'owner', 'user' ]), catchErrors(update))
addresses.patch('/:brandName/admin/:_id', authenticate([ 'owner' ]), catchErrors(adminUpdate))
addresses.delete('/:brandName/:_id', authenticate([ 'admin', 'owner', 'user' ]), catchErrors(remove))
addresses.delete('/:brandName/admin/:_id', authenticate([ 'owner' ]), catchErrors(adminRemove))

export default addresses
