import mongoose, { Schema } from 'mongoose'

import Section from './Section'
import { deleteFiles } from '../utils/s3'

const PageSchema = new Schema({
  brandName: { type: String, maxlength: 90, required: true, },
  sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  slug: { type: String },
  values: {
    backgroundColor: { type: String, trim: true, maxlength: 50 },
    backgroundImage: {
      src: { type: String, trim: true, maxlength: 50 },
      backgroundPosition: { type: String, trim: true, maxlength: 50 },
    },
    description: { type: String, trim: true, minlength: 1, maxlength: 1000},
    name: { type: String, trim: true, minlength: 1, maxlength: 100 },
  },
}, {
  timestamps: true
})


PageSchema.pre('save', async function(next) {
  const page = this
  try {
    const existingPage = await Page.findOne({ brandName: page.brandName, 'values.name': page.values.name })
    if (existingPage) throw 'try a different name, that page already exists'
  } catch (error) {
    next(Error(error))
  }
  next()
})

PageSchema.post('remove', function(doc, next) {
  if (doc.values && doc.values.backgroundImage && doc.values.backgroundImage.src) {
    return deleteFiles([{ Key: doc.values.backgroundImage.src }]).then(() => next())
    .catch(err => next(Error(error)))
  }
  if (doc.sections.length > 0) {
    return doc.sections.forEach(section => Section.findOne({ _id: section.section })
    .then(section => section.remove()).then(() => next())
    .catch(error => next(Error(error))))
  }
  next()
})

const Page = mongoose.model('Page', PageSchema)

export default Page
