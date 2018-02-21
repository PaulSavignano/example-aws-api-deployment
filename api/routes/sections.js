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

sections.post('/:brandName', authenticate(['admin']), catchErrors(add))
sections.get('/:brandName', catchErrors(get))
sections.patch('/:brandName/:_id', authenticate(['admin']), catchErrors(update))
sections.patch('/:brandName/:_id/update-components', authenticate(['admin']), catchErrors(updateComponents))
sections.delete('/:brandName/:_id', authenticate(['admin']), catchErrors(remove))

export default sections
