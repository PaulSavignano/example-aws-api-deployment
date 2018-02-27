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

components.post('/:brandName', authenticate(['admin']), catchErrors(add))
components.get('/:brandName', catchErrors(get))
components.patch('/:brandName/:_id', authenticate(['admin']), catchErrors(update))
components.patch('/:brandName/:sectionId', authenticate(['admin']), catchErrors(updateOrder))
components.delete('/:brandName/:_id', authenticate(['admin']), catchErrors(remove))

export default components
