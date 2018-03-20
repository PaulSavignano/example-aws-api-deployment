import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  update,
  remove,
} from '../controllers/config'

const configs = express.Router()

configs.post('/', authenticate([ 'owner' ]), catchErrors(add))
configs.get('/', authenticate([ 'owner' ]), catchErrors(get))
configs.patch('/:_id', authenticate([ 'owner' ]), catchErrors(update))
configs.delete('/:_id', authenticate([ 'owner' ]), catchErrors(remove))

export default configs
