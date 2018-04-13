import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  remove,
  update,
} from '../controllers/config'

const configs = express.Router()

configs.delete('/:_id', authenticate([ 'owner' ]), catchErrors(remove))
configs.get('/', authenticate([ 'owner' ]), catchErrors(get))
configs.patch('/:_id', authenticate([ 'owner' ]), catchErrors(update))
configs.post('/', authenticate([ 'owner' ]), catchErrors(add))

export default configs
