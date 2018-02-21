import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  getId,
  update,
  remove
} from '../controllers/theme'

const themes = express.Router()

themes.post('/:brandName', authenticate(['admin']), catchErrors(add))
themes.get('/:brandName', catchErrors(get))
themes.patch('/:brandName/:_id', authenticate(['admin']), catchErrors(update))
themes.delete('/:brandName/:_id', authenticate(['admin']), catchErrors(remove))

export default themes
