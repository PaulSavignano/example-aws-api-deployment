import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  updateValues,
  updateComponents,
} from '../controllers/section'

const sections = express.Router()

sections.delete('/:_id', authenticate(['admin']), catchErrors(remove))
sections.get('/', catchErrors(get))
sections.patch('/values/:_id', authenticate(['admin']), catchErrors(updateValues))
sections.patch('/components/:_id', authenticate(['admin']), catchErrors(updateComponents))
sections.post('/', authenticate(['admin']), catchErrors(add))

export default sections
