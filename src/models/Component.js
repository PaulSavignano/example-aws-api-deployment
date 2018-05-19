import mongoose, { Schema } from 'mongoose'

import { deleteFiles } from '../utils/s3'
import {
  alignItems,
  buttonVariant,
  color,
  componentItems,
  components,
  flexFlow,
  justifyContent,
  size,
  typographies,
} from '../utils/options'

const componentSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  page: { type: Schema.ObjectId, ref: 'Page' },
  section: { type: Schema.ObjectId, ref: 'Section' },
  kind: { type: String, trim: true, maxlength: 90, enum: components },
  values: {
    backgroundImage: {
      src: { type: String, trim: true, maxlength: 300 },
      backgroundPosition: { type: String, trim: true, maxlength: 90 },
    },
    href: { type: String, trim: true, maxlength: 300 },
    items: [{
      kind: { type: String, trim: true, maxlength: 90, enum: componentItems },
      iframe: {
        elevation: { type: String, trim: true, max: 25, min: 0 },
        src: { type: String, trim: true, maxlength: 300 },
        style: {
          border: { type: String, trim: true, maxlength: 300 },
          borderRadius: { type: String, trim: true, maxlength: 300 },
          flex: { type: String, trim: true, maxlength: 300 },
        },
      },
      image: {
        elevation: { type: Number, trim: true, max: 25, min: 0 },
        src: { type: String, trim: true, maxlength: 300 },
        style: {
          border: { type: String, trim: true, maxlength: 300 },
          borderRadius: { type: String, trim: true, maxlength: 300 },
          flex: { type: String, trim: true, maxlength: 90 },
          margin: { type: String, trim: true, maxlength: 90 },
        }
      },
      button: {
        children: { type: String, trim: true, maxlength: 300 },
        color: { type: String, enum: color },
        href: { type: String, trim: true, maxlength: 300 },
        size: { type: String, enum: size },        style: {
          flex: { type: String, trim: true, maxlength: 90 },
        },
        variant: { type: String, enum: buttonVariant },
      },
      typographies: [{
        children: { type: String, trim: true, maxlength: 3000 },
        variant: { type: String, enum: typographies },
      }],
      wysiwyg: {
        children: { type: String, trim: true, maxlength: 90000 },
        style: {
          flex: { type: String, trim: true, maxlength: 90 },
          padding: { type: String, trim: true, maxlength: 90 },
        }
      },
      style: {
        color: { type: String, trim: true, maxlength: 90 },
        flex: { type: String, trim: true, maxlength: 90 },
        textAlign: { type: String, enum: alignItems },
      },
    }],
    style: {
      alignItems: { type: String, enum: alignItems },
      backgroundColor: { type: String, trim: true, maxlength: 300 },
      color: { type: String, trim: true, maxlength: 90 },
      flex: { type: String, trim: true, maxlength: 90, default: '1 1 auto' },
      flexFlow: { type: String, enum: flexFlow },
      justifyContent: { type: String, enum: justifyContent },
      margin: { type: String, trim: true, maxlength: 90 },
      padding: { type: String, trim: true, maxlength: 90 },
      textAlign: { type: String, enum: alignItems },
    },
  }
}, {
  timestamps: true
})

componentSchema.index({
  'values.items.typographies.children': 'text',
  'values.items.wysiwyg.children': 'text'
}, {
  name: 'component'
})

componentSchema.post('remove', function(doc, next) {
  const backgroundImageSrc = doc.values && doc.values.style && doc.values.style.backgroundImage ? [{ Key: doc.values.style.backgroundImage }] : []
  const itemSrcs = doc.values && doc.values.items.length ? doc.values.items.filter(i => i.image && i.image.src).map(i => ({ Key: i.image.src })) : []
  const deletes = [ ...backgroundImageSrc, ...itemSrcs]
  if (deletes.length > 0) {
    return deleteFiles(deletes)
    .then(() => next())
    .catch(error => Promise.reject(error))
  }
  next()
})


const Component = mongoose.model('Component', componentSchema)

export default Component
