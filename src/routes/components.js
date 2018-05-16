import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  updateValues,
  updateItemOrder,
} from '../controllers/component'

const components = express.Router()

components.delete('/:_id', authenticate(['admin']), catchErrors(remove))
components.get('/', catchErrors(get))
components.patch('/values/:_id', authenticate(['admin']), catchErrors(updateValues))
components.patch('/item-order/:_id', authenticate(['admin']), catchErrors(updateItemOrder))
components.post('/', authenticate(['admin']), catchErrors(add))

export default components
