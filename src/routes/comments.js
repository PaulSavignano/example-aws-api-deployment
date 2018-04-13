import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  reportAbuse,
  updateLikes,
  updateValues,
} from '../controllers/comments'

const comments = express.Router()

comments.delete('/:_id', authenticate(['admin']), catchErrors(remove))
comments.get('/', catchErrors(get))
comments.patch('/likes/:_id', authenticate(['admin', 'owner', 'user']), catchErrors(updateLikes))
comments.patch('/values/:_id', authenticate(['admin', 'owner', 'user']), catchErrors(updateValues))
comments.post('/', authenticate(['user', 'admin', 'owner']), catchErrors(add))
comments.post('/report-abuse', catchErrors(reportAbuse))

export default comments
