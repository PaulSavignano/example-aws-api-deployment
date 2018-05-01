import mongoose, { Schema } from 'mongoose'

import { addressValuesSchema } from '../utils/schemas'

const orderSchema = new Schema({
  address: addressValuesSchema,
  appName: { type: String, maxlength: 90, required: true },
  cart: { type: Object, required: true },
  email: { type: String, required: true, maxlength: 100 },
  firstName: { type: String, required: true, maxlength: 100 },
  lastName: { type: String, required: true, maxlength: 100 },
  paymentId: { type: String, required: true, maxlength: 500 },
  shipDate: { type: Date },
  shipped: { type: Boolean, default: false },
  total: { type: Number, required: true, min: 1, max: 100000 },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
})

orderSchema.index({
  'values.description': 'text',
  'values.detail': 'text',
  createdAt: 1,
  shipDate: 1,
  total: 1,
}, {
  name: 'order'
})

const Order = mongoose.model('Order', orderSchema)

export default Order
