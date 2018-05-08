import mongoose, { Schema } from 'mongoose'

import { deleteFiles } from '../utils/s3'
import {
  alignItems,
  items,
  components,
  flexFlow,
  justifyContent,
  typographies,
  color,
  size,
} from '../utils/fieldOptions'

const componentSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  page: { type: Schema.ObjectId, ref: 'Page' },
  section: { type: Schema.ObjectId, ref: 'Section' },
  kind: { type: String, trim: true, maxlength: 90, enum: components },
  values: {
    alignItems: { type: String, enum: alignItems },
    backgroundColor: { type: String, trim: true, maxlength: 300 },
    backgroundImage: {
      src: { type: String, trim: true, maxlength: 300 },
      backgroundPosition: { type: String, trim: true, maxlength: 90 },
    },
    color: { type: String, trim: true, maxlength: 90 },
    flex: { type: String, trim: true, maxlength: 90, default: '1 1 auto' },
    flexFlow: { type: String, enum: flexFlow },
    hash: { type: String, trim: true, maxlength: 300 },
    justifyContent: { type: String, enum: justifyContent },
    link: { type: String, trim: true, maxlength: 300 },
    margin: { type: String, trim: true, maxlength: 90 },
    items: [{
      flex: { type: String, trim: true, maxlength: 90 },
      kind: { type: String, trim: true, maxlength: 90, enum: items },
      padding: { type: String, trim: true, maxlength: 90 },
      textAlign: { type: String, enum: alignItems },
      iframe: {
        border: { type: String, trim: true, maxlength: 300 },
        borderRadius: { type: String, trim: true, maxlength: 300 },
        elevation: { type: String, trim: true, max: 25, min: 0 },
        flex: { type: String, trim: true, maxlength: 300 },
        src: { type: String, trim: true, maxlength: 300 },
      },
      image: {
        border: { type: String, trim: true, maxlength: 300 },
        borderRadius: { type: String, trim: true, maxlength: 300 },
        elevation: { type: Number, trim: true, max: 25, min: 0 },
        flex: { type: String, trim: true, maxlength: 90 },
        margin: { type: String, trim: true, maxlength: 90 },
        src: { type: String, trim: true, maxlength: 300 },
      },
      button: {
        content: { type: String, trim: true, maxlength: 300 },
        color: { type: String, enum: color },
        href: { type: String, trim: true, maxlength: 300 },
        size: { type: String, enum: size },
        flex: { type: String, trim: true, maxlength: 90 },
      },
      typographies: [{
        content: { type: String, trim: true, maxlength: 3000 },
        variant: { type: String, enum: typographies },
      }],
      wysiwyg: {
        content: { type: String, trim: true, maxlength: 9000 },
        flex: { type: String, trim: true, maxlength: 90 },
        padding: { type: String, trim: true, maxlength: 90 },
      },
    }],
  }
}, {
  timestamps: true
})

componentSchema.index({
  'values.items.typographies.content': 'text',
  'values.items.wysiwyg.content': 'text'
}, {
  name: 'component'
})

componentSchema.post('remove', function(doc, next) {
  const backgroundImageSrc = doc.values && doc.values.backgroundImage && doc.values.backgroundImage.src ? [{ Key: doc.values.backgroundImage.src }] : []
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
