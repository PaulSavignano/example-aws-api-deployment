import mongoose, { Schema } from 'mongoose'

const OrderSchema = new Schema({
  address: { type: Object, required: true },
  appName: { type: String, maxlength: 90, required: true },
  cart: { type: Object, required: true },
  email: { type: String, required: true, maxlength: 100 },
  firstName: { type: String, required: true, maxlength: 100 },
  lastName: { type: String, required: true, maxlength: 100 },
  paymentId: { type: String, required: true, maxlength: 500 },
  shipDate: { type: Date },
  shipped: { type: Boolean },
  total: { type: Number, required: true, min: 1, max: 100000 },
  user: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
})

const Order = mongoose.model('Order', OrderSchema)

export default Order
