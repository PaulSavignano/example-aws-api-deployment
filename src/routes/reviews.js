import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  adminRemove,
  adminUpdate,
  get,
  remove,
  update,
} from '../controllers/review'

const reviews = express.Router()

reviews.post('/:brandName', authenticate(['user', 'admin', 'owner']), catchErrors(add))

reviews.get('/:brandName', catchErrors(get))

reviews.patch('/:brandName/:_id', authenticate(['admin', 'owner', 'user']), catchErrors(update))
reviews.patch('/:brandName/admin/:_id', authenticate(['admin', 'owner']), catchErrors(adminUpdate))

reviews.delete('/:brandName/:_id', authenticate(['admin']), catchErrors(remove))
reviews.delete('/:brandName/admin/:_id', authenticate(['admin']), catchErrors(adminRemove))

export default reviews
