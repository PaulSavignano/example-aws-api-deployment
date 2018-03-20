import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  update,
  updateOrder
} from '../controllers/component'

const components = express.Router()

components.post('/', authenticate(['admin']), catchErrors(add))
components.get('/', catchErrors(get))
components.patch('/:_id', authenticate(['admin']), catchErrors(update))
components.patch('/:sectionId', authenticate(['admin']), catchErrors(updateOrder))
components.delete('/:_id', authenticate(['admin']), catchErrors(remove))

export default components
