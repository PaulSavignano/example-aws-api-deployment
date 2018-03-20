import mongoose, { Schema } from 'mongoose'

import Address from './Address'
import Config from './Config'
import Blog from './Blog'
import Cart from './Cart'
import Component from './Component'
import Order from './Order'
import Page from './Page'
import Product from './Product'
import Section from './Section'
import Theme from './Theme'
import User from './User'
import { deleteFile } from '../utils/s3'
import { alignItems, flexFlow, justifyContent, textAlign } from '../utils/fieldOptions'

const BrandSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true, unique: true },
  business: {
    address: {
      city: { type: String, trim: true, maxlength: 100, default: 'Carlsbad' },
      zip: { type: String, trim: true, maxlength: 50, default: '12345' },
      state: { type: String, trim: true, maxlength: 25, default: 'CA' },
      street: { type: String, trim: true, maxlength: 100, default: '123 Fourth St' },
    },
    email: { type: String, trim: true, maxlength: 100, default: 'info@yourbrandrocks.com' },
    googleAnalyticsUA: { type: String, trim: true, maxlength: 150 },
    image: {
      border: { type: String, trim: true, maxlength: 300 },
      borderRadius: { type: String, trim: true, maxlength: 300 },
      elevation: { type: Number, trim: true, max: 24, min: 0 },
      margin: { type: String, trim: true, maxlength: 300 },
      src: { type: String, trim: true, maxlength: 900 },
    },
    keywords: { type: String, trim: true, maxlength: 1000 },
    license: { type: String, trim: true, maxlength: 100 },
    name: {
      fontFamily: {type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
      fontSize: {type: String, trim: true, maxlength: 100, default: '1.3125rem' },
      fontWeight: {type: String, trim: true, maxlength: 100, default: '500' },
      letterSpacing: {type: String, trim: true, maxlength: 100, default: '1px' },
      text: {type: String, trim: true, maxlength: 100, default: 'Brand' },
      textShadow: {type: String, trim: true, maxlength: 100 },
    },
    phone: { type: String, trim: true, maxlength: 50, default: '(123) 456-7899' },
    phoneStyle: { type: String, trim: true, maxlength: 1000 },
    stripePkLive: { type: String, trim: true, maxlength: 500 },
    stripePkTest: { type: String, trim: true, maxlength: 500 },
  },
  pages: [{ type: Schema.Types.ObjectId, ref: 'Page' }],
  socialMedia: {
    facebook: { type: String, trim: true, maxlength: 150 },
    github: { type: String, trim: true, maxlength: 150 },
    googleplus: { type: String, trim: true, maxlength: 150 },
    instagram: { type: String, trim: true, maxlength: 150 },
    linkedin: { type: String, trim: true, maxlength: 150 },
    twitter: { type: String, trim: true, maxlength: 150 },
    yelp: { type: String, trim: true, maxlength: 150 },
    youtube: { type: String, trim: true, maxlength: 150 },
  }
},{
  timestamps: true
})

BrandSchema.post('remove', function(doc, next) {
  const { business } = doc
  if (business.image && business.image.src) {
    deleteFiles({ Key: appBar.image.src })
    .catch(err => console.error(err))
  }



  Address.deleteMany({ appName: doc.appName }).then(deletes => console.info('Address deleteMany', deletes)).catch(error => console.error(error))
  Config.deleteMany({ appName: doc.appName }).then(deletes => console.info('Config deleteMany', deletes)).catch(error => console.error(error))

  Blog.find({ appName: doc.appName })
  .then(items => items.length && items.forEach(item => item.remove()))
  .catch(error => console.error(error))

  Cart.deleteMany({ appName: doc.appName }).then(deletes => console.info('Cart deleteMany', deletes)).catch(error => console.error(error))

  Component.find({ appName: doc.appName })
  .then(items => items.length && items.forEach(item => item.remove()))
  .catch(error => console.error(error))

  Order.deleteMany({ appName: doc.appName }).then(deletes => console.info('Order deleteMany', deletes)).catch(error => console.error(error))

  Page.find({ appName: doc.appName })
  .then(items => items.length && items.forEach(item => item.remove()))
  .catch(error => console.error(error))

  Product.find({ appName: doc.appName })
  .then(items => items.length && items.forEach(item => item.remove()))
  .catch(error => console.error(error))

  Section.find({ appName: doc.appName })
  .then(items => items.length && items.forEach(item => item.remove()))
  .catch(error => console.error(error))

  Theme.find({ appName: doc.appName })
  .then(items => items.length && items.forEach(item => item.remove()))
  .catch(error => console.error(error))

  User.deleteMany({ appName: doc.appName }).then(deletes => console.info('User deleteMany', deletes)).catch(error => console.error(error))
  next()
})

const Brand = mongoose.model('Brand', BrandSchema)

export default Brand
