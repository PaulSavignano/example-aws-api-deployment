import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  update,
  reportAbuse,
} from '../controllers/comments'

const comments = express.Router()

comments.post('/', authenticate(['user', 'admin', 'owner']), catchErrors(add))
comments.post('/report-abuse', catchErrors(reportAbuse))
comments.get('/', catchErrors(get))
comments.patch('/:_id', authenticate(['admin', 'owner', 'user']), catchErrors(update))
comments.delete('/:_id', authenticate(['admin']), catchErrors(remove))


export default comments
