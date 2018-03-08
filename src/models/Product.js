import mongoose, { Schema } from 'mongoose'

import { deleteFiles } from '../utils/s3'

const ProductSchema = new Schema({
  brandName: { type: String, maxlength: 90, required: true },
  published: { Type: Boolean, default: false },
  section: { type: Schema.Types.ObjectId, ref: 'Section' },
  values: {
    category: { type: String, minlength: 1, trim: true, maxlength: 150 },
    description: { type: String, minlength: 1, trim: true, maxlength: 500 },
    detail: { type: String, minlength: 1, trim: true, maxlength: 1000 },
    iframe: {
      border: { type: String, trim: true, maxlength: 25 },
      borderRadius: { type: String, trim: true, maxlength: 25 },
      elevation: { type: Number, trim: true, max: 25, min: 0 },
      flex: { type: String, trim: true, maxlength: 100 },
      src: { type: String, trim: true, maxlength: 500 },
    },
    image: {
      border: { type: String, trim: true, maxlength: 25 },
      borderRadius: { type: String, trim: true, maxlength: 25 },
      elevation: { type: Number, trim: true, max: 25, min: 0 },
      flex: { type: String, trim: true, maxlength: 100 },
      src: { type: String, trim: true, maxlength: 500 },
    },
    name: { type: String, minlength: 1, trim: true, maxlength: 50 },
    price: { type: Number, default: 0 , max: 100000, min: 0 },
  }
}, {
  timestamps: true
})

ProductSchema.index({
  'values.name': 'text',
  'values.description': 'text'
})


ProductSchema.post('remove', function(doc, next) {
  if (doc.values && doc.values.image && doc.values.image.src) return deleteFiles([{ Key: doc.values.image.src }])
  .then(() => next())
  .catch(error => next(Error(error)))
  next()
})

const Product = mongoose.model('Product', ProductSchema)

export default Product
