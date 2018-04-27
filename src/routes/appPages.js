import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  get,
  update,
  remove
} from '../controllers/appPages'

const pages = express.Router()

pages.delete('/:_id', authenticate(['admin']), catchErrors(remove))
pages.get('/', catchErrors(get))
pages.patch('/:_id', authenticate(['admin']), catchErrors(update))

export default pages
