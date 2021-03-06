import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  adminGet,
  adminRemove,
  updatePublish,
  get,
  userGet,
  remove,
  updateLikes,
  updateValues,
} from '../controllers/review'

const reviews = express.Router()

reviews.delete('/:_id', authenticate(['user']), catchErrors(remove))
reviews.delete('/admin/:_id', authenticate(['admin']), catchErrors(adminRemove))
reviews.get('/', catchErrors(get))
reviews.get('/user', authenticate(['user']), catchErrors(userGet))
reviews.get('/admin', authenticate(['admin']), catchErrors(adminGet))
reviews.patch('/publish/:_id', authenticate(['admin']), catchErrors(updatePublish))
reviews.patch('/likes/:_id', authenticate(['admin', 'owner', 'user']), catchErrors(updateLikes))
reviews.patch('/values/:_id', authenticate(['admin', 'owner', 'user']), catchErrors(updateValues))
reviews.post('/', authenticate(['user', 'admin', 'owner']), catchErrors(add))

export default reviews
