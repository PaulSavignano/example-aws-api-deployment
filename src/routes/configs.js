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

configs.post('/:brandName', authenticate([ 'owner' ]), catchErrors(add))
configs.get('/:brandName', authenticate([ 'owner' ]), catchErrors(get))
configs.patch('/:brandName/:_id', authenticate([ 'owner' ]), catchErrors(update))
configs.delete('/:brandName/:_id', authenticate([ 'owner' ]), catchErrors(remove))

export default configs
