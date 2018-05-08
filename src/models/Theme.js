import mongoose, { Schema } from 'mongoose'

import { deleteFile } from '../utils/s3'
import {
  alignItems,
  color,
  flexFlow,
  justifyContent,
} from '../utils/fieldOptions'

const themeSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  header: {
    actionButton: {
      children: { type: String, trim: true, maxlength: 300 },
      color: { type: String, enum: color },
      href: { type: String, trim: true, maxlength: 300 },
    },
    backgroundColor: { type: String, trim: true, maxlength: 50, default: '#2196f3' },
    color: { type: String, trim: true, maxlength: 25, default: 'rgb(255, 255, 255)' },
    imageDisplay: { type: Boolean, default: false },
    imagePosition: { type: String, enum: ['absolute', 'relative'], default: ['relative'], maxlength: 25 },
    imageWidth: { type: String, trim: true, maxlength: 25 },
    phoneDisplay: { type: Boolean, default: false },
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
      alignItems: { type: String, enum: alignItems, default: 'center' },
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
    letterSpacing: { type: String, trim: true, maxlength: 100, default: '0.04em' },
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
      letterSpacing: { type: String, trim: true, maxlength: 100 },
      lineHeight: { type: String, trim: true, maxlength: 100, default: '1.06667em' },
      marginLeft: { type: String, trim: true, maxlength: 100, default: '-.04em'},
      textShadow: { type: String, trim: true, maxlength: 100 },
    },
    display1: {
      color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.54)' },
      fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
      fontSize: { type: String, trim: true, maxlength: 100, default: '2.125rem' },
      fontWeight: { type: Number, trim: true, maxlength: 100, default: 400 },
      letterSpacing: { type: String, trim: true, maxlength: 100 },
      lineHeight: { type: String, trim: true, maxlength: 100, default: '1.20588em' },
      marginLeft: { type: String, trim: true, maxlength: 100, default: '-.04em'},
      textShadow: { type: String, trim: true, maxlength: 100 },
    },
    headline: {
      color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.87)' },
      fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
      fontSize: { type: String, trim: true, maxlength: 100, default: '1.5rem' },
      fontWeight: { type: Number, trim: true, maxlength: 100, default: 400 },
      letterSpacing: { type: String, trim: true, maxlength: 100 },
      lineHeight: { type: String, trim: true, maxlength: 100, default: '1.35417em' },
    },
    title: {
      color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.87)' },
      fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
      fontSize: { type: String, trim: true, maxlength: 100, default: '1.3125rem' },
      fontWeight: { type: Number, trim: true, maxlength: 100, default: 500 },
      letterSpacing: { type: String, trim: true, maxlength: 100 },
      lineHeight: { type: String, trim: true, maxlength: 100, default: '1.16667em' },
    },
    subheading: {
      color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.54)' },
      fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
      fontSize: { type: String, trim: true, maxlength: 100, default: '1rem' },
      fontWeight: { type: Number, trim: true, maxlength: 100, default: 400 },
      letterSpacing: { type: String, trim: true, maxlength: 100 },
      lineHeight: { type: String, trim: true, maxlength: 100, default: '1.5em' },
    },
    body2: {
      color: { type: String, trim: true, maxlength: 100, default: 'rgba(0, 0, 0, 0.87)' },
      fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
      fontSize: { type: String, trim: true, maxlength: 100, default: '0.875rem' },
      fontWeight: { type: Number, trim: true, maxlength: 100, default: 500 },
      letterSpacing: { type: String, trim: true, maxlength: 100 },
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
      letterSpacing: { type: String, trim: true, maxlength: 100 },
      lineHeight: { type: String, trim: true, maxlength: 100, default: '1.375em' },
    },
    button: {
      fontFamily: { type: String, trim: true, maxlength: 100, default: 'Roboto, sans-serif' },
      fontSize: { type: String, trim: true, maxlength: 100, default: '0.875rem' },
      fontWeight: { type: Number, trim: true, maxlength: 100, default: 500 },
      letterSpacing: { type: String, trim: true, maxlength: 100 },
      textTransform: { type: String, trim: true, maxlength: 100, default: 'uppercase'}
    },
  },
},{
  timestamps: true
})

themeSchema.post('remove', function(doc, next) {
  const { footer } = doc
  if (footer.image && footer.image.src) {
    deleteFile({ Key: footer.image.src })
    .then(() => next)
    .catch(error => Promise.reject(error))
  }
  next()
})

const Theme = mongoose.model('Theme', themeSchema)

export default Theme
