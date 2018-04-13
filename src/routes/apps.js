import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  update,
} from '../controllers/app'

const apps = express.Router()

apps.delete('/:_id', authenticate(['admin']), catchErrors(remove))
apps.get('/', catchErrors(get))
apps.patch('/:_id', authenticate(['admin']), catchErrors(update))
apps.post('/', authenticate(['admin']), catchErrors(add))

export default apps
