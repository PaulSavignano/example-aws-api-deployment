import express from 'express'

import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  getId,
  remove,
  update,
} from '../controllers/blog'
import catchErrors from '../utils/catchErrors'

const blogs = express.Router()

blogs.post('/:brandName', authenticate(['admin']), catchErrors(add))
blogs.get('/:brandName', catchErrors(get))
blogs.get('/:brandName/:_id', catchErrors(getId))
blogs.patch('/:brandName/:_id', authenticate(['admin']), catchErrors(update))
blogs.delete('/:brandName/:_id', authenticate(['admin']), catchErrors(remove))

export default blogs
