import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  update,
  updatePageIdsOrder,
  updateSections,
  updateValue,
} from '../controllers/page'

const pages = express.Router()

pages.delete('/:_id', authenticate(['admin']), catchErrors(remove))
pages.get('/', catchErrors(get))
pages.patch('/:_id', authenticate(['admin']), catchErrors(update))
pages.patch('/:_id/update-pageids-order', authenticate(['admin']), catchErrors(updatePageIdsOrder))
pages.patch('/:_id/update-sections', authenticate(['admin']), catchErrors(updateSections))
pages.patch('/:_id/update-value', authenticate(['admin']), catchErrors(updateValue))
pages.post('/', authenticate(['admin']), catchErrors(add))

export default pages
