import mongoose, { Schema } from 'mongoose'

const ConfigSchema = new Schema({
  brandName: { type: String, maxlength: 90, required: true, unique: true },
  values: {
    gmailUser: { type: String, trim: true, maxlength: 150 },
    moverbaseKey: { type: String, trim: true, maxlength: 150 },
    oauthAccessToken: { type: String, trim: true, maxlength: 150 },
    oauthClientId: { type: String, trim: true, maxlength: 150 },
    oauthClientSecret: { type: String, trim: true, maxlength: 150 },
    oauthRefreshToken: { type: String, trim: true, maxlength: 150 },
    stripeSkLive: { type: String, trim: true, maxlength: 150 },
    stripeSkTest: { type: String, trim: true, maxlength: 150 },
  }
},{
  timestamps: true
})

const Config = mongoose.model('Config', ConfigSchema)

export default Config
