import mongoose, { Schema } from 'mongoose'
import { deleteFiles } from '../utils/s3'

const blogSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  page: { type: Schema.ObjectId, ref: 'Page' },
  published: { Type: Boolean, default: false },
  rating: {
    avg: { type: Number, min: 0, max: 5 },
    stars: { type: Number, min: 0, max: 1000000 },
    reviews: { type: Number, min: 0, max: 1000000 },
  },
  section: { type: Schema.Types.ObjectId, ref: 'Section' },
  values: {
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

blogSchema.index({
  'values.title': 'text',
  'values.description': 'text',
  'values.detail': 'text'
})


blogSchema.post('remove', function(doc, next) {
  if (doc.values && doc.values.image && doc.values.image.src) {
    return deleteFiles([{ Key: doc.values.image.src }])
    .catch(error => Promise.reject(error))
  }
  next()
})

const Blog = mongoose.model('Blog', blogSchema)

export default Blog
