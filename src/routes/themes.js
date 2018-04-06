import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  update,
  remove
} from '../controllers/theme'

const themes = express.Router()

themes.post('/', authenticate(['admin']), catchErrors(add))
themes.get('/', catchErrors(get))
themes.patch('/:_id', authenticate(['admin']), catchErrors(update))
themes.delete('/:_id', authenticate(['admin']), catchErrors(remove))

export default themes
