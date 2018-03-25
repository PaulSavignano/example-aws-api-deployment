import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  update,
} from '../controllers/review'

const reviews = express.Router()

reviews.post('/', authenticate(['user', 'admin', 'owner']), catchErrors(add))
reviews.get('/', catchErrors(get))
reviews.patch('/:_id', authenticate(['admin', 'owner', 'user']), catchErrors(update))
reviews.delete('/:_id', authenticate(['admin']), catchErrors(remove))


export default reviews
