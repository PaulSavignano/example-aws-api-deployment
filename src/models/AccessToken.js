import mongoose, { Schema } from 'mongoose'

const accessTokenSchema = new Schema({
  accessToken: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '24h' },
  appName: { type: String, maxlength: 90, required: true },
  user: { type: Schema.ObjectId, ref: 'User' },
})

const AccessToken = mongoose.model('AccessToken', accessTokenSchema)

export default AccessToken
