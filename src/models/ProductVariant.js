import mongoose, { Schema } from 'mongoose'

import { deleteFiles } from '../utils/s3'

const productVariantSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  product: { type: Schema.ObjectId, ref: 'Product' },
  values: {
    assets: [{
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
    }],
    name: { type: String, minlength: 1, trim: true, maxlength: 50 },
    price: { type: Number, default: 0 , max: 100000, min: 0 },
  },
}, {
  timestamps: true
})

productVariantSchema.index({
  'values.name': 'text',
}, {
  name: 'productVariant'
})

productVariantSchema.post('remove', function(doc, next) {
  if (doc.values && doc.values.assets) {
    const imageSrcs = doc.values.assets.filter(a => a.image && a.image.src).map(i => ({ Key: i.image.src }))
    deleteFiles(imageSrcs).catch(error => console.error(error))
  }
  next()
})

const Product = mongoose.model('Product', productVariantSchema)

export default Product
