import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  update,
  updatePages,
  remove
} from '../controllers/brand'

const brands = express.Router()

brands.post('/', authenticate(['admin']), catchErrors(add))
brands.get('/', catchErrors(get))
brands.patch('/:_id', authenticate(['admin']), catchErrors(update))
brands.patch('/:_id/update-pages', authenticate(['admin']), catchErrors(updatePages))
brands.delete('/:_id', authenticate(['admin']), catchErrors(remove))

export default brands
