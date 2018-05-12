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
    backgroundImage: {
      src: { type: String, trim: true, maxlength: 90 },
      backgroundPosition: { type: String, trim: true, maxlength: 50 },
    },
    description: { type: String, trim: true, minlength: 1, maxlength: 1000},
    style: {
      backgroundColor: { type: String, trim: true, maxlength: 50 },
    }
  }
}, {
  timestamps: true
})


pageSchema.post('remove', async function(doc, next) {
  try {
    if (doc.values && doc.values.backgroundImage && doc.values.backgroundImage.src) {
      await deleteFiles([{ Key: doc.values.backgroundImage.src }])
    }
    if (doc.sections.length > 0) {
      Section.find({ _id: { $in: doc.sections }})
      .then(items => items.forEach(item => item.remove()))
      .catch(error => Promise.reject(error))
    }
    next()
  } catch (error) {
    next(error)
  }
})

const Page = mongoose.model('Page', pageSchema)

export default Page
