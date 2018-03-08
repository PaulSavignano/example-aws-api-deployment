import express from 'express'

import catchErrors from '../utils/catchErrors'
import authenticate from '../middleware/authenticate'
import {
  addBlogReview,
  addProductReview,
  getAdminKind,
  getId,
  getKindId,
  getKind,
  remove,
  update,
} from '../controllers/review'

const reviews = express.Router()

reviews.post('/:brandName/blog-review', authenticate(['admin']), catchErrors(addBlogReview))
reviews.post('/:brandName/product-review', authenticate(['admin']), catchErrors(addProductReview))

reviews.get('/:brandName/admin-kind/:kind/:page', authenticate(['admin']), catchErrors(getAdminKind))
reviews.get('/:brandName/id/:_id', authenticate(['admin','owner','user']), catchErrors(getId))
reviews.get('/:brandName/kind-id/:kindId/:page', catchErrors(getKindId))
reviews.get('/:brandName/kind/:kind/:page', authenticate(['admin','owner','user']), catchErrors(getKind))

reviews.patch('/:brandName/:_id', authenticate(['admin']), catchErrors(update))
reviews.delete('/:brandName/:_id', authenticate(['admin']), catchErrors(remove))

export default reviews
