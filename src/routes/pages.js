import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  update,
  updateValues,
  updateSections,
  remove
} from '../controllers/page'

const pages = express.Router()

pages.post('/', authenticate(['admin']), catchErrors(add))
pages.get('/', catchErrors(get))
pages.patch('/:_id', authenticate(['admin']), catchErrors(update))
pages.patch('/:_id/update-value', authenticate(['admin']), catchErrors(updateValues))
pages.patch('/:_id/update-sections', authenticate(['admin']), catchErrors(updateSections))
pages.delete('/:_id', authenticate(['admin']), catchErrors(remove))

export default pages
