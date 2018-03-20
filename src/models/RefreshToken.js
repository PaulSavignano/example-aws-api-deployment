import mongoose, { Schema } from 'mongoose'

const RefreshTokenSchema = new Schema({
  createdAt: { type: Date, default: Date.now, expires: '7d' },
  appName: { type: String, maxlength: 90, required: true },
  refreshToken: { type: String, required: true },
  user: { type: Schema.ObjectId, ref: 'User' },
}, {
  timestamps: true
})

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema)

export default RefreshToken
