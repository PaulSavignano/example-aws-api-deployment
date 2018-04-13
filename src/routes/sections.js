import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  update,
  updateComponents,
} from '../controllers/section'

const sections = express.Router()

sections.delete('/:_id', authenticate(['admin']), catchErrors(remove))
sections.get('/', catchErrors(get))
sections.patch('/:_id', authenticate(['admin']), catchErrors(update))
sections.patch('/:_id/update-components', authenticate(['admin']), catchErrors(updateComponents))
sections.post('/', authenticate(['admin']), catchErrors(add))

export default sections
