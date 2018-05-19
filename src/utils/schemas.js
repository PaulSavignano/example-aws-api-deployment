import {
  alignItems,
  color,
  flexFlow,
  justifyContent,
  size,
  typographies,
} from './options'


export const iframe = {
  elevation: { type: String, trim: true, max: 25, min: 0 },
  src: { type: String, trim: true, maxlength: 300 },
  style: {
    border: { type: String, trim: true, maxlength: 300 },
    borderRadius: { type: String, trim: true, maxlength: 300 },
    flex: { type: String, trim: true, maxlength: 300 },
  },
}


export const image = {
  elevation: { type: Number, trim: true, max: 25, min: 0 },
  src: { type: String, trim: true, maxlength: 300 },
  style: {
    border: { type: String, trim: true, maxlength: 300 },
    borderRadius: { type: String, trim: true, maxlength: 300 },
    flex: { type: String, trim: true, maxlength: 90 },
    margin: { type: String, trim: true, maxlength: 90 },
  }
}


export const button = {
  children: { type: String, trim: true, maxlength: 300 },
  color: { type: String, enum: color },
  href: { type: String, trim: true, maxlength: 300 },
  size: { type: String, enum: size },
  style: {
    flex: { type: String, trim: true, maxlength: 90 },
  },
}


export const typography = {
  children: { type: String, trim: true, maxlength: 3000 },
  variant: { type: String, enum: typographies },
}


export const wysiwyg = {
  children: { type: String, trim: true, maxlength: 9000 },
  style: {
    flex: { type: String, trim: true, maxlength: 90 },
    padding: { type: String, trim: true, maxlength: 90 },
  }
}


export const style = {
  alignItems: { type: String, enum: alignItems },
  backgroundColor: { type: String, trim: true, maxlength: 300 },
  color: { type: String, trim: true, maxlength: 90 },
  flex: { type: String, trim: true, maxlength: 90, default: '1 1 auto' },
  flexFlow: { type: String, enum: flexFlow },
  justifyContent: { type: String, enum: justifyContent },
  margin: { type: String, trim: true, maxlength: 90 },
  padding: { type: String, trim: true, maxlength: 90 },
  textAlign: { type: String, enum: alignItems },
}
