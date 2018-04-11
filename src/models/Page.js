import mongoose, { Schema } from 'mongoose'

import Section from './Section'
import { deleteFiles } from '../utils/s3'

const pageSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true, },
  sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  slug: { type: String, maxlength: 90 },
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


pageSchema.pre('save', async function(next) {
  const page = this
  try {
    const existingPage = await Page.findOne({ appName: page.appName, 'values.name': page.values.name })
    if (existingPage) throw 'try a different name, that page already exists'
  } catch (error) {
    next(Error(error))
  }
  next()
})

pageSchema.post('remove', async function(doc, next) {
  try {
    if (doc.values && doc.values.backgroundImage && doc.values.backgroundImage.src) {
      await deleteFiles([{ Key: doc.values.backgroundImage.src }])
    }
    if (doc.sections.length > 0) {
      doc.sections.forEach(async (section) => await Section.findOne({ _id: section.section })
      .then(section => section.remove()))
    }
    next()
  } catch (error) {
    throw Error(error)
  }
})

const Page = mongoose.model('Page', pageSchema)

export default Page
