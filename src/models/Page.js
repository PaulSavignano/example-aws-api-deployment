import mongoose, { Schema } from 'mongoose'

import Section from './Section'
import { deleteFiles } from '../utils/s3'

const pageSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true, },
  sections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
  slug: { type: String, maxlength: 90 },
  url: { type: String, trim: true, maxlength: 90 },
  name: { type: String, trim: true, minlength: 1, maxlength: 100 },
  values: {
    backgroundColor: { type: String, trim: true, maxlength: 50 },
    backgroundImage: {
      src: { type: String, trim: true, maxlength: 50 },
      backgroundPosition: { type: String, trim: true, maxlength: 50 },
    },
    description: { type: String, trim: true, minlength: 1, maxlength: 1000},
  },
}, {
  timestamps: true
})


pageSchema.post('remove', async function(doc, next) {
  try {
    if (doc.values && doc.values.backgroundImage && doc.values.backgroundImage.src) {
      await deleteFiles([{ Key: doc.values.backgroundImage.src }])
    }
    if (doc.sections.length > 0) {
      doc.sections.forEach(async (section) => await Section.findOne({ _id: section })
      .then(section => section.remove()))
      .catch(error => Promise.reject(error))
    }
    next()
  } catch (error) {
    throw Error(error)
  }
})

const Page = mongoose.model('Page', pageSchema)

export default Page
