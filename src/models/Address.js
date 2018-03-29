import mongoose, { Schema } from 'mongoose'

import { addressValuesSchema } from '../utils/schemas'

const addressSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  values: addressValuesSchema,
  user: { type: Schema.ObjectId, ref: 'User' }
}, {
  timestamps: true
})

const Address = mongoose.model('Address', addressSchema)

export default Address
