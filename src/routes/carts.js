import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  getId,
  update,
  remove
} from '../controllers/cart'

const carts = express.Router()

carts.post('/', catchErrors(add))
carts.get('/:_id', catchErrors(getId))
carts.patch('/:_id', catchErrors(update))
carts.delete('/:_id', catchErrors(remove))

export default carts
