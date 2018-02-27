import mongoose, { Schema } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import { ObjectID } from 'mongodb'

import ErrorObject from '../utils/ErrorObject'

import Address from './Address'
import Order from './Order'

const UserSchema = new Schema({
  addresses: [{ type: Schema.ObjectId, ref: 'Address' }],
  brandName: { type: String, maxlength: 90, required: true },
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

function autopopulate(next) {
  this.populate({ path: 'addresses', select: '-user' })
  next()
}

UserSchema.pre('find', autopopulate)
UserSchema.pre('findOne', autopopulate)

UserSchema.methods.toJSON = function() {
  const user = this
  const userObject = user.toObject()
  const { _id, addresses, roles, values } = userObject
  return { _id, addresses, roles, values }
}


UserSchema.statics.findByCredentials = function(email, password) {
  const User = this
  return User.findOne({ 'values.email': email.toLowerCase() })
  .populate({ path: 'addresses' })
  .then(user => {
    if (!user) throw new ObjectError({ email: 'User not found', status: 404 })
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password)
      .then(res => {
        if (res) {
          resolve(user)
        } else {
          throw new ObjectError({ password: 'Password does not match', status: 404 })
        }
      })
    })
  })
}


UserSchema.pre('save', function(next) {
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


UserSchema.post('remove', function(doc, next) {
  if (doc.addresses.length > 0) {
    return Address.deleteMany({ user: doc._id })
    .then(() => next())
    .catch(error => next(Error(error)))
  }
  next()
})

const User = mongoose.model('User', UserSchema)

export default User