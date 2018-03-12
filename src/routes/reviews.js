import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  addBlogReview,
  addProductReview,
  get,
  getId,
  adminGetUser,
  adminGetId,
  adminGetAll,
  adminGetKind,
  getKindId,
  getKind,
  remove,
  update,
} from '../controllers/review'

const reviews = express.Router()

reviews.post('/:brandName/blog-review', authenticate(['admin']), catchErrors(addBlogReview))
reviews.post('/:brandName/product-review', authenticate(['admin']), catchErrors(addProductReview))

reviews.get('/:brandName/user', authenticate(['user']), catchErrors(get))
reviews.get('/:brandName/user-id/:_id', authenticate(['user']), catchErrors(getId))
reviews.get('/:brandName/admin-user/:userId', authenticate(['admin', 'owner']), catchErrors(adminGetUser))
reviews.get('/:brandName/admin-kind/:kind', authenticate(['admin', 'owner']), catchErrors(adminGetKind))
reviews.get('/:brandName/admin-id/:_id', authenticate(['admin', 'owner']), catchErrors(adminGetId))
reviews.get('/:brandName/admin-all', authenticate(['admin', 'owner']), catchErrors(adminGetAll))
reviews.get('/:brandName/kind-id/:kindId', catchErrors(getKindId))
reviews.get('/:brandName/kind/:kind', authenticate(['admin','owner','user']), catchErrors(getKind))

reviews.patch('/:brandName/:_id', authenticate(['admin']), catchErrors(update))
reviews.delete('/:brandName/:_id', authenticate(['admin']), catchErrors(remove))

export default reviews
