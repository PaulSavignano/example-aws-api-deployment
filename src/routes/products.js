import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  getId,
  remove,
  update,
} from '../controllers/product'

const products = express.Router()

products.post('/', authenticate(['admin']), catchErrors(add))
products.get('/', catchErrors(get))
products.get('/:_id', catchErrors(getId))
products.patch('/:_id', authenticate(['admin']), catchErrors(update))
products.delete('/:_id', authenticate(['admin']), catchErrors(remove))

export default products
