import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  getUser,
  getId,
  adminGetUser,
  adminGetId,
  adminGetAll,
  getSalesByYear,
  getSalesByMonth,
  getSalesByDay,
  update,
  remove
} from '../controllers/order'

const orders = express.Router()

orders.post('/:brandName', authenticate(['user']), catchErrors(add))

orders.get('/:brandName/user', authenticate(['user']), catchErrors(getUser))
orders.get('/:brandName/user-id/:_id', authenticate(['user']), catchErrors(getId))
orders.get('/:brandName/admin', authenticate(['admin', 'owner']), catchErrors(adminGetUser))
orders.get('/:brandName/admin-id/:_id', authenticate(['admin', 'owner']), catchErrors(adminGetId))
orders.get('/:brandName/admin-all', authenticate(['admin', 'owner']), catchErrors(adminGetAll))

orders.get('/:brandName/sales-by-day', authenticate(['user']), catchErrors(getSalesByDay))
orders.get('/:brandName/sales-by-month', authenticate(['user']), catchErrors(getSalesByMonth))
orders.get('/:brandName/sales-by-year', authenticate(['user']), catchErrors(getSalesByYear))


orders.patch('/:brandName/:_id', authenticate(['admin']), catchErrors(update))

export default orders
