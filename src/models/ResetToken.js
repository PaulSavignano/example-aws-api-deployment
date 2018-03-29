import mongoose, { Schema } from 'mongoose'

const resetTokenSchema = new Schema({
  createdAt: { type: Date, default: Date.now, expires: '1h' },
  appName: { type: String, maxlength: 90, required: true },
  resetToken: { type: String, required: true },
  user: { type: Schema.ObjectId, ref: 'User' },
})

const ResetToken = mongoose.model('ResetToken', resetTokenSchema)

export default ResetToken
