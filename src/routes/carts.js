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

carts.post('/:brandName', catchErrors(add))
carts.get('/:brandName/:_id', catchErrors(getId))
carts.patch('/:brandName/:_id', catchErrors(update))
carts.delete('/:brandName/:_id', catchErrors(remove))

export default carts
