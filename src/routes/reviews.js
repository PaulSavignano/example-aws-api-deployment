import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  adminRemove,
  adminUpdate,
  get,
  getGraph,
  remove,
  updateLikes,
  updateValues,
} from '../controllers/review'

const reviews = express.Router()

reviews.post('/', authenticate(['user', 'admin', 'owner']), catchErrors(add))
reviews.get('/', catchErrors(get))
reviews.get('/graph', catchErrors(getGraph))
reviews.patch('/likes/:_id', authenticate(['admin', 'owner', 'user']), catchErrors(updateLikes))
reviews.patch('/values/:_id', authenticate(['admin', 'owner', 'user']), catchErrors(updateValues))
reviews.patch('/admin/:_id', authenticate(['admin', 'owner']), catchErrors(adminUpdate))
reviews.delete('/:_id', authenticate(['admin']), catchErrors(remove))
reviews.delete('/admin/:_id', authenticate(['admin']), catchErrors(adminRemove))


export default reviews
