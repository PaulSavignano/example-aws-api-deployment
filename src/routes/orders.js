import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  adminGet,
  get,
  getSalesByDay,
  getSalesByMonth,
  getSalesByYear,
  update,
} from '../controllers/order'

const orders = express.Router()

orders.get('/', authenticate(['user']), catchErrors(get))
orders.get('/admin', authenticate(['admin', 'owner']), catchErrors(adminGet))
orders.get('/sales-by-day', authenticate(['user']), catchErrors(getSalesByDay))
orders.get('/sales-by-month', authenticate(['user']), catchErrors(getSalesByMonth))
orders.get('/sales-by-year', authenticate(['user']), catchErrors(getSalesByYear))
orders.patch('/:_id', authenticate(['admin']), catchErrors(update))
orders.post('/', authenticate(['user']), catchErrors(add))

export default orders
