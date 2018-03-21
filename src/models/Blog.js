import mongoose, { Schema } from 'mongoose'
import { deleteFiles } from '../utils/s3'

const BlogSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  page: { type: Schema.ObjectId, ref: 'Page' },
  pageSlug: { type: String, trim: true, maxlength: 100 },
  section: { type: Schema.Types.ObjectId, ref: 'Section' },
  published: { Type: Boolean, default: false },
  values: {
    label: { type: String, minlength: 1, trim: true, maxlength: 150 },
    description: { type: String, minlength: 1, trim: true, maxlength: 150 },
    detail: { type: String, minlength: 1, trim: true, maxlength: 5000 },
    iframe: {
      border: { type: String, trim: true, maxlength: 25 },
      borderRadius: { type: String, trim: true, maxlength: 25 },
      elevation: { type: Number, trim: true, max: 25, min: 0 },
      flex: { type: String, trim: true, maxlength: 100 },
      src: { type: String, trim: true, maxlength: 500 },
    },
    image: {
      border: { type: String, trim: true, maxlength: 25 },
      borderRadius: { type: String, trim: true, maxlength: 25 },
      elevation: { type: Number, trim: true, max: 25, min: 0 },
      flex: { type: String, trim: true, maxlength: 100 },
      src: { type: String, trim: true, maxlength: 500 },
    },
    title: { type: String, minlength: 1, trim: true, maxlength: 150 },
  }
}, {
  timestamps: true
})

BlogSchema.index({
  'values.title': 'text',
  'values.description': 'text',
  'values.detail': 'text'
})


BlogSchema.post('remove', function(doc, next) {
  if (doc.values && doc.values.image && doc.values.image.src) return deleteFiles([{ Key: doc.values.image.src }])
  .then(() => next())
  .catch(error => next(Error(error)))
  next()
})

const Blog = mongoose.model('Blog', BlogSchema)

export default Blog
