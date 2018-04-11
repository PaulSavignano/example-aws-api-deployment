import mongoose, { Schema } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'

import Address from './Address'

const userSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }],
  password: { type: String, required: true, maxlength: 500, minlength: 6 },
  roles: {
    type: [{ type: String, enum: ['admin', 'master', 'owner', 'user'], maxlength: 25 }],
    default: ['user']
  },
  values: {
    email: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      minlength: 1,
      lowercase: true,
      validate: {
        validator: value => validator.isEmail(value),
        message: '{VALUE} is not a valid email'
      }
    },
    firstName: { type: String, trim: true, maxlength: 100, minlength: 1, required: true },
    lastName: { type: String, trim: true, maxlength: 100, minlength: 1, required: true },
    phone: { type: String, trim: true, maxlength: 50, minlength: 1 },
  }
}, {
  timestamps: true
})


userSchema.methods.toJSON = function() {
  const user = this
  const userObject = user.toObject()
  const { _id, roles, values, addresses } = userObject
  return { _id, roles, values, addresses }
}



userSchema.pre('save', function(next) {
  const user = this
  if (user.isModified('password')) {
    return bcrypt.genSalt(10, (err, salt) => {
      return bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})


userSchema.post('remove', function(doc, next) {
  if (doc.addresses.length > 0) {
    return Address.deleteMany({ user: doc._id })
    .then(() => next)
    .catch(error => Promise.reject(error))
  }
  next()
})

const User = mongoose.model('User', userSchema)

export default User
