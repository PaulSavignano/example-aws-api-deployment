import mongoose, { Schema } from 'mongoose'

const orderSchema = new Schema({
  address: {
    _id: { type: Schema.Types.ObjectId, ref: 'Address' },
    name: { type: String, trim: true, minlength: 1, maxlength: 50 },
    phone: { type: String, trim: true, minlength: 1, maxlength: 20 },
    street: { type: String, trim: true, minlength: 1, maxlength: 50 },
    city: { type: String, trim: true, minlength: 1, maxlength: 50 },
    zip: { type: String, trim: true, minlength: 1, maxlength: 12 },
    state: { type: String, trim: true, minlength: 1, maxlength: 6 }
  },
  appName: { type: String, maxlength: 90, required: true },
  cart: { type: Object, required: true },
  email: { type: String, required: true, maxlength: 100 },
  firstName: { type: String, required: true, maxlength: 100 },
  lastName: { type: String, required: true, maxlength: 100 },
  paymentId: { type: String, required: true, maxlength: 500 },
  shipDate: { type: Date },
  shipped: { type: Boolean, default: false },
  total: { type: Number, required: true, min: 1, max: 100000000000 },
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
