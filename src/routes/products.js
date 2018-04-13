import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  adminGet,
  get,
  remove,
  update,
} from '../controllers/product'

const products = express.Router()

products.delete('/:_id', authenticate(['admin']), catchErrors(remove))
products.get('/', catchErrors(get))
products.get('/admin', authenticate(['admin']), catchErrors(adminGet))
products.patch('/:_id', authenticate(['admin']), catchErrors(update))
products.post('/', authenticate(['admin']), catchErrors(add))

export default products
