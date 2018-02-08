import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  update,
  updateName,
  remove
} from '../controllers/page'

const pages = express.Router()

pages.post('/:brandName', authenticate(['admin']), catchErrors(add))
pages.get('/:brandName', catchErrors(get))
pages.patch('/:brandName/:_id', authenticate(['admin']), catchErrors(update))
pages.patch('/:brandName/:_id/update-name', authenticate(['admin']), catchErrors(updateName))
pages.delete('/:brandName/:_id', authenticate(['admin']), catchErrors(remove))

export default pages
