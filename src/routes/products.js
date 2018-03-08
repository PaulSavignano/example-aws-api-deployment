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

products.post('/:brandName', authenticate(['admin']), catchErrors(add))
products.get('/:brandName', catchErrors(get))
products.get('/:brandName/:_id', catchErrors(getId))
products.patch('/:brandName/:_id', authenticate(['admin']), catchErrors(update))
products.delete('/:brandName/:_id', authenticate(['admin']), catchErrors(remove))

export default products
