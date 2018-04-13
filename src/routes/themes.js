import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  update,
} from '../controllers/theme'

const themes = express.Router()

themes.delete('/:_id', authenticate(['admin']), catchErrors(remove))
themes.get('/', catchErrors(get))
themes.patch('/:_id', authenticate(['admin']), catchErrors(update))
themes.post('/', authenticate(['admin']), catchErrors(add))

export default themes
