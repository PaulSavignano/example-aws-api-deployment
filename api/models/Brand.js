import mongoose, { Schema } from 'mongoose'

import Address from './Address'
import ApiConfig from './ApiConfig'
import Blog from './Blog'
import Cart from './Cart'
import Component from './Component'
import Order from './Order'
import Page from './Page'
import Product from './Product'
import Section from './Section'
import User from './User'
import { deleteFiles } from '../utils/s3'
import { alignItems, flexFlow, justifyContent, textAlign } from '../utils/fieldOptions'

const BrandSchema = new Schema({
  brandName: { type: String, maxlength: 90, required: true, unique: true },
  business: {
    address: {
      city: { type: String, trim: true, maxlength: 100, default: 'Carlsbad' },
      zip: { type: String, trim: true, maxlength: 50, default: '12345' },
      state: { type: String, trim: true, maxlength: 25, default: 'CA' },
      street: { type: String, trim: true, maxlength: 100, default: '123 Fourth St' },
    },
    description: { type: String, trim: true, maxlength: 1000, default: 'Your brand rocks!' },
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
  theme: {
    appBar: {
      backgroundColor: { type: String, trim: true, maxlength: 50, default: '#2196f3' },
      color: { type: String, trim: true, maxlength: 25, default: 'rgb(255, 255, 255)' },
      imageDisplay: { type: String, enum: ['false', 'true'], default: ['false'], maxlength: 25 },
      imagePosition: { type: String, enum: ['absolute', 'relative'], default: ['relative'], maxlength: 25 },
      imageWidth: { type: String, trim: true, maxlength: 25 },
      phoneDisplay: { type: String, enum: ['false', 'true'], default: ['false'], maxlength: 25 },
      phoneSize: { type: String, trim: true, maxlength: 25 },
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
        border: { type: String, trim: true, maxlength: 300 },
        borderRadius: { type: String, trim: true, maxlength: 300 },
        elevation: { type: Number, trim: true, max: 24, min: 0 },
        margin: { type: String, trim: true, maxlength: 300 },
        src: { type: String, trim: true, maxlength: 900 },
      },
      text: {
        color: { type: String, trim: true, maxlength: 50, default: '#ffffff' },
        alignItems: { type: String, enum: alignItems },
      }
    },
    palette: {
      common: {
        transparent: { type: String, trim: true, maxlength: 50, default: 'transparent' },
        black: { type: String, trim: true, maxlength: 50, default: '#000' },
        fullBlack: { type: String, trim: true, maxlength: 50, default: 'rgba(0,0,0,1)' },
        white: { type: String, trim: true, maxlength: 50, default: '#fff' },
        fullWhite: { type: String, trim: true, maxlength: 50, default: 'rgba(255,255,255,1)' },
      },
      primary: {
        light: { type: String, trim: true, maxlength: 50, default: '#7986cb' },
        main: { type: String, trim: true, maxlength: 50, default: '#3f51b5', },
        dark: { type: String, trim: true, maxlength: 50, default: '#303f9f' },
        contrastText: { type: String, trim: true, maxlength: 50, default: 'rgba(255, 255, 255, 1)' }
      },
      secondary: {
        light: { type: String, trim: true, maxlength: 50, default: '#ff4081' },
        main: { type: String, trim: true, maxlength: 50, default: '#f50057', },
        dark: { type: String, trim: true, maxlength: 50, default: '#c51162' },
        contrastText: { type: String, trim: true, maxlength: 50, default: 'rgba(255, 255, 255, 1)' }
      },
      error: {
        light: { type: String, trim: true, maxlength: 50, default: 'rgb(246, 104, 94)' },
        main: { type: String, trim: true, maxlength: 50, default: '#f44336', },
        dark: { type: String, trim: true, maxlength: 50, default: 'rgb(170, 46, 37)' },
        contrastText: { type: String, trim: true, maxlength: 50, default: 'rgba(255, 255, 255, 1)' }
      },
      grey: {
        50: { type: String, trim: true, maxlength: 50, default: '#fafafa' },
        100: { type: String, trim: true, maxlength: 50, default: '#f5f5f5', },
        200: { type: String, trim: true, maxlength: 50, default: '#eeeeee' },
        300: { type: String, trim: true, maxlength: 50, default: '#e0e0e0' },
        400: { type: String, trim: true, maxlength: 50, default: '#bdbdbd' },
        500: { type: String, trim: true, maxlength: 50, default: '#9e9e9e' },
        600: { type: String, trim: true, maxlength: 50, default: '#757575' },
        700: { type: String, trim: true, maxlength: 50, default: '#616161' },
        800: { type: String, trim: true, maxlength: 50, default: '#424242' },
        900: { type: String, trim: true, maxlength: 50, default: '#212121' },
        A100: { type: String, trim: true, maxlength: 50, default: '#d5d5d5' },
        A200: { type: String, trim: true, maxlength: 50, default: '#aaaaaa' },
        A400: { type: String, trim: true, maxlength: 50, default: '#303030' },
        A700: { type: String, trim: true, maxlength: 50, default: '#616161' },
      },
      text: {
        primary: { type: String, trim: true, maxlength: 50, default: 'rgba(100, 100, 0, 0.87)' },
        secondary: { type: String, trim: true, maxlength: 50, default: 'rgba(0, 0, 0, 0.54)' },
        disabled: { type: String, trim: true, maxlength: 50, default: 'rgba(0, 0, 0, 0.38)' },
        hint: { type: String, trim: true, maxlength: 50, default: 'rgba(0, 0, 0, 0.38)' },
      },
      background: {
        paper: { type: String, trim: true, maxlength: 100, default: '#fff' },
        default: { type: String, trim: true, maxlength: 100, default: '#fafafa' },
        appBar: { type: String, trim: true, maxlength: 100, default: '#f5f5f5' },
        chip: { type: String, trim: true, maxlength: 100, default: '#e0e0e0' },
        avatar: { type: String, trim: true, maxlength: 100, default: '#bdbdbd' },
      },
      action: {
        active: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.54)' },
        hover: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.14)' },
        selected: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.08)' },
        disabled: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.26)' },
        disabledBackground: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.12)' },
      },
    },
    typography: {
      fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
      fontSize: { type: Number, trim: true, maxlength: 100, default: 14 },
      fontWeightLight: { type: Number, trim: true, maxlength: 100, default: 300 },
      fontWeightMedium: { type: Number, trim: true, maxlength: 100, default: 500 },
      fontWeightRegular: { type: Number, trim: true, maxlength: 100, default: 400 },
      display4: {
        color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.54)' },
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '7rem' },
        fontWeight: { type: Number, trim: true, maxlength: 100, default: 300 },
        letterSpacing: { type: String, trim: true, maxlength: 100, default: '-.04em' },
        lineHeight: { type: String, trim: true, maxlength: 100, default: '1.14286em' },
        marginLeft: { type: String, trim: true, maxlength: 100, default: '-.06em'},
        textShadow: { type: String, trim: true, maxlength: 100 },
      },
      display3: {
        color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.54)' },
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '3.5rem' },
        fontWeight: { type: Number, trim: true, maxlength: 100, default: 400 },
        letterSpacing: { type: String, trim: true, maxlength: 100, default: '-.02em' },
        lineHeight: { type: String, trim: true, maxlength: 100, default: '1.30357em' },
        marginLeft: { type: String, trim: true, maxlength: 100, default: '-.04em'},
        textShadow: { type: String, trim: true, maxlength: 100 },
      },
      display2: {
        color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.54)' },
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '2.8125rem' },
        fontWeight: { type: Number, trim: true, maxlength: 100, default: 400 },
        lineHeight: { type: String, trim: true, maxlength: 100, default: '1.06667em' },
        marginLeft: { type: String, trim: true, maxlength: 100, default: '-.04em'},
        textShadow: { type: String, trim: true, maxlength: 100 },
      },
      display1: {
        color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.54)' },
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '2.125rem' },
        fontWeight: { type: Number, trim: true, maxlength: 100, default: 400 },
        lineHeight: { type: String, trim: true, maxlength: 100, default: '1.20588em' },
        marginLeft: { type: String, trim: true, maxlength: 100, default: '-.04em'},
        textShadow: { type: String, trim: true, maxlength: 100 },
      },
      headline: {
        color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.87)' },
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '1.5rem' },
        fontWeight: { type: Number, trim: true, maxlength: 100, default: 400 },
        lineHeight: { type: String, trim: true, maxlength: 100, default: '1.35417em' },
      },
      title: {
        color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.87)' },
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '1.3125rem' },
        fontWeight: { type: Number, trim: true, maxlength: 100, default: 500 },
        lineHeight: { type: String, trim: true, maxlength: 100, default: '1.16667em' },
      },
      subheading: {
        color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.54)' },
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '1rem' },
        fontWeight: { type: Number, trim: true, maxlength: 100, default: 400 },
        lineHeight: { type: String, trim: true, maxlength: 100, default: '1.5em' },
      },
      body2: {
        color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.87)' },
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '0.875rem' },
        fontWeight: { type: Number, trim: true, maxlength: 100, default: 500 },
        lineHeight: { type: String, trim: true, maxlength: 100, default: '1.71429em' },
      },
      body1: {
        color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.87)' },
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '0.875rem' },
        fontWeight: { type: Number, trim: true, maxlength: 100, default: 400 },
        lineHeight: { type: String, trim: true, maxlength: 100, default: '1.46429em' },
      },
      caption: {
        color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.54)' },
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '0.75rem' },
        fontWeight: { type: Number, trim: true, maxlength: 100, default: 400 },
        lineHeight: { type: String, trim: true, maxlength: 100, default: '1.375em' },
      },
      button: {
        fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
        fontSize: { type: String, trim: true, maxlength: 100, default: '0.875rem' },
        fontWeight: { type: Number, trim: true, maxlength: 100, default: 500 },
        textTransform: { type: String, trim: true, maxlength: 100, default: 'uppercase'}
      },
    },
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

BrandSchema.post('remove', function(doc, next) {
  const { appBar, footer } = doc
  if (appBar.image) {
    deleteFiles([{ Key: appBar.image }])
    .catch(err => console.error(err))
  }
  if (footer.image) {
    deleteFiles([{ Key: footer.image }])
    .catch(err => console.error(err))
  }
  if (footer.backgroundImage) {
    deleteFiles([{ Key: footer.backgroundImage }])
    .catch(err => console.error(err))
  }
  if (body.backgroundImage) {
    deleteFiles([{ Key: body.backgroundImage }])
    .catch(err => console.error(err))
  }



  Address.deleteMany({ brandName: doc.brandName }).then(deletes => console.info('Address deleteMany', deletes)).catch(error => console.error(error))
  ApiConfig.deleteMany({ brandName: doc.brandName }).then(deletes => console.info('ApiConfig deleteMany', deletes)).catch(error => console.error(error))

  Blog.find({ brandName: doc.brandName })
  .then(items => items.length && items.forEach(item => Blog.findOne({ _id: item._id }).then(blog => blog.remove())))
  .catch(error => console.error(error))

  Cart.deleteMany({ brandName: doc.brandName }).then(deletes => console.info('Cart deleteMany', deletes)).catch(error => console.error(error))

  Component.find({ brandName: doc.brandName })
  .then(items => items.length && items.forEach(item => Component.findOne({ _id: item._id }).then(component => component.remove())))
  .catch(error => console.error(error))

  Order.deleteMany({ brandName: doc.brandName }).then(deletes => console.info('Order deleteMany', deletes)).catch(error => console.error(error))

  Page.find({ brandName: doc.brandName })
  .then(items => items.length && items.forEach(item => Page.findOne({ _id: item._id }).then(page => page.remove())))
  .catch(error => console.error(error))

  Product.find({ brandName: doc.brandName })
  .then(items => items.length && items.forEach(item => Hero.findOne({ _id: item._id }).then(product => product.remove())))
  .catch(error => console.error(error))

  Section.find({ brandName: doc.brandName })
  .then(items => items.forEach(item => Hero.findOne({ _id: item._id }).then(section => section.remove())))
  .catch(error => console.error(error))

  User.deleteMany({ brandName: doc.brandName }).then(deletes => console.info('User deleteMany', deletes)).catch(error => console.error(error))
  next()
})

const Brand = mongoose.model('Brand', BrandSchema)

export default Brand
