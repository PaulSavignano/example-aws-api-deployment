import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  getAdmin,
  update,
  remove
} from '../controllers/order'

const orders = express.Router()

orders.post('/:brandName', authenticate(['user']), catchErrors(add))
orders.get('/:brandName', authenticate(['user']), catchErrors(get))
orders.get('/:brandName/admin', authenticate(['admin', 'owner']), catchErrors(getAdmin))
orders.patch('/:brandName/:_id', authenticate(['admin']), catchErrors(update))

export default orders
