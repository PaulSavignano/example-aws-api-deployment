import express from 'express'

import catchErrors from '../utils/catchErrors'
import {
  add,
  getId,
  update,
  remove
} from '../controllers/cart'

const carts = express.Router()

carts.delete('/:_id', catchErrors(remove))
carts.get('/:_id', catchErrors(getId))
carts.patch('/:_id', catchErrors(update))
carts.post('/', catchErrors(add))

export default carts
