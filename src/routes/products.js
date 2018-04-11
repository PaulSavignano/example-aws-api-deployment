import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  adminGet,
  remove,
  update,
} from '../controllers/product'

const products = express.Router()

products.post('/', authenticate(['admin']), catchErrors(add))
products.get('/', catchErrors(get))
products.get('/admin', authenticate(['admin']), catchErrors(adminGet))
products.patch('/:_id', authenticate(['admin']), catchErrors(update))
products.delete('/:_id', authenticate(['admin']), catchErrors(remove))

export default products
