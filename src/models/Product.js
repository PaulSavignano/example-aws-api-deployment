import mongoose, { Schema } from 'mongoose'

import { deleteFiles } from '../utils/s3'

const productSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  published: { type: Boolean, default: false },
  rating: {
    avg: { type: Number, min: 0, max: 5, default: 0 },
    stars: { type: Number, min: 0, max: 1000000, default: 0 },
    reviews: { type: Number, min: 0, max: 1000000, default: 0 },
  },
  values: {
    description: { type: String, minlength: 1, trim: true, maxlength: 500 },
    detail: { type: String, minlength: 1, trim: true, maxlength: 1000 },
    iframe: {
      elevation: { type: Number, trim: true, max: 25, min: 0 },
      src: { type: String, trim: true, maxlength: 500 },
      style: {
        border: { type: String, trim: true, maxlength: 25 },
        borderRadius: { type: String, trim: true, maxlength: 25 },
        flex: { type: String, trim: true, maxlength: 100 },
      }
    },
    image: {
      elevation: { type: Number, trim: true, max: 25, min: 0 },
      src: { type: String, trim: true, maxlength: 500 },
      style: {
        border: { type: String, trim: true, maxlength: 25 },
        borderRadius: { type: String, trim: true, maxlength: 25 },
        flex: { type: String, trim: true, maxlength: 100 },
      }
    },
    name: { type: String, minlength: 1, trim: true, maxlength: 50 },
    price: { type: Number, default: 0 , max: 100000, min: 0 },
  }
}, {
  timestamps: true
})

productSchema.index({
  'values.description': 'text',
  'values.detail': 'text',
  'values.name': 'text',
  'rating.avg': 1,
  createdAt: 1
}, {
  name: 'product'
})

productSchema.post('remove', function(doc, next) {
  if (doc.values && doc.values.image && doc.values.image.src) {
    deleteFiles([{ Key: doc.values.image.src }]).catch(error => console.error(error))
  }
  next()
})

const Product = mongoose.model('Product', productSchema)

export default Product
