import mongoose, { Schema } from 'mongoose'

import { deleteFiles } from '../utils/s3'
import {
  alignItems,
  color,
  flexFlow,
  justifyContent,
} from '../utils/options'
import AppPages from './AppPages'
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

const appSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true, unique: true },
  business: {
    address: {
      city: { type: String, trim: true, maxlength: 100, default: 'Carlsbad' },
      zip: { type: String, trim: true, maxlength: 50, default: '12345' },
      state: { type: String, trim: true, maxlength: 25, default: 'CA' },
      street: { type: String, trim: true, maxlength: 100, default: '123 Fourth St' },
    },
    description: { type: String, trim: true, minlength: 1, maxlength: 3000, default: 'Solutions'},
    email: { type: String, trim: true, maxlength: 100, default: 'info@yourapprocks.com' },
    googleAnalyticsUA: { type: String, trim: true, maxlength: 150 },
    image: {
      elevation: { type: Number, trim: true, max: 24, min: 0 },
      src: { type: String, trim: true, maxlength: 900 },
      style: {
        border: { type: String, trim: true, maxlength: 300 },
        borderRadius: { type: String, trim: true, maxlength: 300 },
        margin: { type: String, trim: true, maxlength: 300 },
      }
    },
    keywords: { type: String, trim: true, minlength: 1, maxlength: 3000, default: 'React, Redux, Express, Mongo'},
    license: { type: String, trim: true, maxlength: 100 },
    name: {
      children: { type: String, trim: true, maxlength: 100, default: 'App' },
      style: {
        color: { type: String, trim: true, maxlength: 100 },
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '1.3125rem' },
        fontWeight: { type: String, trim: true, maxlength: 100, default: '500' },
        letterSpacing: { type: String, trim: true, maxlength: 100, default: '1px' },
        textShadow: { type: String, trim: true, maxlength: 100 },
      },
    },
    phone: { type: String, trim: true, maxlength: 50, default: '(123) 456-7899' },
    phoneStyle: { type: String, trim: true, maxlength: 1000 },
    stripePkLive: { type: String, trim: true, maxlength: 500 },
    stripePkTest: { type: String, trim: true, maxlength: 500 },
  },
  hasBlogs: { Type: Boolean, default: false },
  hasProducts: { Type: Boolean, default: false },
  header: {
    actionButton: {
      children: { type: String, trim: true, maxlength: 300 },
      color: { type: String, enum: color },
      href: { type: String, trim: true, maxlength: 300 },
    },
    imageDisplay: { type: Boolean, default: false },
    imagePosition: { type: String, enum: ['absolute', 'relative'], default: ['relative'], maxlength: 25 },
    imageWidth: { type: Number, min: 0, max: 9000 },
    nameDisplay: { type: Boolean, default: true },
    phoneDisplay: { type: Boolean, default: false },
    style: {
      backgroundColor: { type: String, trim: true, maxlength: 50, default: '#2196f3' },
      color: { type: String, trim: true, maxlength: 25, default: 'rgb(255, 255, 255)' },
    },
  },
  footer: {
    paper: {
      alignItems: { type: String, enum: alignItems, default: 'center' },
      backgroundColor: { type: String, trim: true, maxlength: 50, default: '#2196f3' },
      borderBottom: { type: String, trim: true, maxlength: 50 },
      borderTop: { type: String, trim: true, maxlength: 50 },
      boxShadow: { type: String, trim: true, maxlength: 100 },
      flexFlow: { type: String, enum: flexFlow },
      justifyContent: { type: String, enum: justifyContent, default: 'center' },
    },
    image: {
      style: {
        border: { type: String, trim: true, maxlength: 300 },
        borderRadius: { type: String, trim: true, maxlength: 300 },
        margin: { type: String, trim: true, maxlength: 300 },
      },
      elevation: { type: Number, trim: true, max: 24, min: 0 },
      src: { type: String, trim: true, maxlength: 900 },
    },
    text: {
      color: { type: String, trim: true, maxlength: 50, default: '#ffffff' },
      alignItems: { type: String, enum: alignItems, default: 'center' },
    }
  },
  page: {
    maxWidth: { type: String, trim: true, maxlength: 90, default: '1044px' },
    padding: { type: String, trim: true, maxlength: 90, default: '32px 0' },
  },
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

appSchema.post('remove', function(doc, next) {
  const { business } = doc
  if (business.image && business.image.src) {
    deleteFiles({ Key: business.image.src })
    .catch(err => console.error(err))
  }

  AppPages.find({ appName: doc.appName })
  .then(doc => doc.remove())
  .catch(error => console.error(error))

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

const App = mongoose.model('App', appSchema)

export default App
