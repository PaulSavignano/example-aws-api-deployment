import express from 'express'

import authenticate from '../middleware/authenticate'
import {
  add,
  get,
  adminGet,
  remove,
  update,
} from '../controllers/blog'
import catchErrors from '../utils/catchErrors'

const blogs = express.Router()

blogs.delete('/:_id', authenticate(['admin']), catchErrors(remove))
blogs.get('/', catchErrors(get))
blogs.get('/admin', authenticate(['admin']), catchErrors(adminGet))
blogs.patch('/:_id', authenticate(['admin']), catchErrors(update))
blogs.post('/', authenticate(['admin']), catchErrors(add))

export default blogs
