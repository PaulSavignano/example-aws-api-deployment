import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  getId,
  update,
  updatePages,
  remove
} from '../controllers/brand'

const brands = express.Router()

brands.post('/:brandName', authenticate(['admin']), catchErrors(add))
brands.get('/:brandName', catchErrors(get))
brands.patch('/:brandName/:_id', authenticate(['admin']), catchErrors(update))
brands.patch('/:brandName/:_id/update-pages', authenticate(['admin']), catchErrors(updatePages))
brands.delete('/:brandName/:_id', authenticate(['admin']), catchErrors(remove))

export default brands
