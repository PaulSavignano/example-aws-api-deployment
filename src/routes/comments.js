import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  updateLikes,
  updateValues,
  reportAbuse,
} from '../controllers/comments'

const comments = express.Router()

comments.post('/', authenticate(['user', 'admin', 'owner']), catchErrors(add))
comments.post('/report-abuse', catchErrors(reportAbuse))
comments.get('/', catchErrors(get))
comments.patch('/likes/:_id', authenticate(['admin', 'owner', 'user']), catchErrors(updateLikes))
comments.patch('/values/:_id', authenticate(['admin', 'owner', 'user']), catchErrors(updateValues))
comments.delete('/:_id', authenticate(['admin']), catchErrors(remove))


export default comments
