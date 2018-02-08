import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  update,
  remove,
} from '../controllers/apiConfig'

const apiConfigs = express.Router()

apiConfigs.post('/:brandName', authenticate([ 'owner' ]), catchErrors(add))
apiConfigs.get('/:brandName', authenticate([ 'owner' ]), catchErrors(get))
apiConfigs.patch('/:brandName/:_id', authenticate([ 'owner' ]), catchErrors(update))
apiConfigs.delete('/:brandName/:_id', authenticate([ 'owner' ]), catchErrors(remove))

export default apiConfigs
