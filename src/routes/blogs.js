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

blogs.post('/', authenticate(['admin']), catchErrors(add))
blogs.get('/', catchErrors(get))
blogs.get('/:_id', catchErrors(getId))
blogs.patch('/:_id', authenticate(['admin']), catchErrors(update))
blogs.delete('/:_id', authenticate(['admin']), catchErrors(remove))

export default blogs
