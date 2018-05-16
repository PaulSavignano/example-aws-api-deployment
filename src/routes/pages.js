import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  updateKey,
  updateName,
  updateOrder,
  updateSections,
  updateValue,
  updateValues,
} from '../controllers/page'

const pages = express.Router()

pages.delete('/:_id', authenticate(['admin']), catchErrors(remove))
pages.get('/', catchErrors(get))
pages.patch('/key/:_id', authenticate(['admin']), catchErrors(updateKey))
pages.patch('/name/:_id', authenticate(['admin']), catchErrors(updateName))
pages.patch('/order/:_id', authenticate(['admin']), catchErrors(updateOrder))
pages.patch('/sections/:_id', authenticate(['admin']), catchErrors(updateSections))
pages.patch('/value/:_id', authenticate(['admin']), catchErrors(updateValue))
pages.patch('/values/:_id', authenticate(['admin']), catchErrors(updateValues))
pages.post('/', authenticate(['admin']), catchErrors(add))

export default pages
