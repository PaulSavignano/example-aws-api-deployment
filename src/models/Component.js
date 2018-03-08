import mongoose, { Schema } from 'mongoose'

import { deleteFiles } from '../utils/s3'
import {
  alignItems,
  items,
  components,
  flexFlow,
  justifyContent,
  textAlign,
  typographies,
} from '../utils/fieldOptions'

const ComponentSchema = new Schema({
  brandName: { type: String, maxlength: 90, required: true },
  page: { type: Schema.ObjectId, ref: 'Page' },
  pageSlug: { type: String, trim: true, maxlength: 25 },
  section: { type: Schema.ObjectId, ref: 'Section' },
  kind: { type: String, trim: true, maxlength: 500, enum: components },
  values: {
    alignItems: { type: String, enum: alignItems },
    backgroundColor: { type: String, trim: true, maxlength: 50 },
    backgroundImage: {
      src: { type: String, trim: true, maxlength: 900 },
      backgroundPosition: { type: String, trim: true, maxlength: 50 },
    },
    color: { type: String, trim: true, maxlength: 50 },
    content: { type: String, trim: true, maxlength: 500 },
    elevation: { type: Number, trim: true, max: 25, min: 0 },
    flex: { type: String, trim: true, maxlength: 15, default: '1 1 auto' },
    flexFlow: { type: String, enum: flexFlow },
    justifyContent: { type: String, enum: justifyContent },
    link: { type: String, trim: true, maxlength: 90 },
    margin: { type: String, trim: true, maxlength: 50 },
    items: [{
      kind: { type: String, trim: true, maxlength: 500, enum: items },
      content: { type: String, trim: true, maxlength: 25 },
      flex: { type: String, trim: true, maxlength: 100 },
      link: { type: String, trim: true, maxlength: 100, },
      textAlign: { type: String, enum: alignItems },
      iframe: {
        border: { type: String, trim: true, maxlength: 25 },
        borderRadius: { type: String, trim: true, maxlength: 25 },
        elevation: { type: String, trim: true, max: 25, min: 0 },
        flex: { type: String, trim: true, maxlength: 100 },
        src: { type: String, trim: true, maxlength: 25 },
      },
      image: {
        border: { type: String, trim: true, maxlength: 25 },
        borderRadius: { type: String, trim: true, maxlength: 25 },
        elevation: { type: Number, trim: true, max: 25, min: 0 },
        flex: { type: String, trim: true, maxlength: 100 },
        margin: { type: String, trim: true, maxlength: 100 },
        src: { type: String, trim: true, maxlength: 500 },
      },
      button: {
        content: { type: String, trim: true, maxlength: 25 },
        flex: { type: String, trim: true, maxlength: 100 },
        link: { type: String, trim: true, maxlength: 100, },
      },
      typographies: [{
        content: { type: String, trim: true, maxlength: 500 },
        kind: { type: String, trim: true, maxlength: 500, enum: typographies },
      }],
      wysiwyg: {
        flex: { type: String, trim: true, maxlength: 100 },
        content: { type: String, trim: true, maxlength: 25 },
      },
    }],
  }
}, {
  timestamps: true
})

ComponentSchema.index({
  'items.typographies.content': 'text',
  'items.wysiwyg': 'text'
})

ComponentSchema.post('remove', function(doc, next) {
  const backgroundImageSrc = doc.values && doc.values.backgroundImage && doc.values.backgroundImage.src ? [{ Key: doc.values.backgroundImage.src }] : []
  const itemSrcs = doc.values && doc.values.items.length ? doc.values.items.filter(i => i.image && i.image.src).map(i => ({ Key: i.image.src })) : []
  const deletes = [ ...backgroundImageSrc, ...itemSrcs]
  if (deletes.length > 0) return deleteFiles(deletes).then(() => next()).catch(error => next(Error(error)))
  next()
})

const Component = mongoose.model('Component', ComponentSchema)

export default Component
