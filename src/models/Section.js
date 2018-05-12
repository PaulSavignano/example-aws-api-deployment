import mongoose, { Schema } from 'mongoose'

import Component from './Component'

import { deleteFiles } from '../utils/s3'
import { alignItems, flexFlow, justifyContent } from '../utils/fieldOptions'

const sectionSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  components: [{ type: Schema.Types.ObjectId, ref: 'Component' }],
  page: { type: Schema.ObjectId, ref: 'Page' },
  values: {
    backgroundImage: {
      src: { type: String, trim: true, maxlength: 900 },
      backgroundPosition: { type: String, trim: true, maxlength: 50 },
    },
    hash: { type: String, trim: true, maxlength: 50 },
    style: {
      alignItems: { type: String, enum: alignItems },
      backgroundColor: { type: String, trim: true, maxlength: 50 },
      color: { type: String, trim: true, maxlength: 100 },
      flexFlow: { type: String, enum: flexFlow },
      justifyContent: { type: String, enum: justifyContent },
      margin: { type: String, trim: true, default: '0 auto', maxlength: 50 },
      maxWidth: { type: String, trim: true, default: '1044px', maxlength: 50 },
      minHeight: { type: String, trim: true, maxlength: 50 },
      padding: { type: String, trim: true, maxlength: 50 },
    },
    type: { type: String, trim: true, default: 'Flex', enum: [ 'Flex', 'SlideShow', 'Swipeable' ] },
  }
}, {
  timestamps: true
})


sectionSchema.post('remove', async function(doc, next) {
  try {
    if (doc.values && doc.values.style && doc.values.style.backgroundImage) {
      await deleteFiles([{ Key: doc.values.style.backgroundImage }])
    }
    if (doc.components.length > 0) {
      doc.components.forEach((component) => {
        return Component.findOne({ _id: component })
        .then(component => component.remove())
        .catch(error => Promise.reject(error))
      })
    }
    next()
  } catch (error) {
    throw Error(error)
  }
})

const Section = mongoose.model('Section', sectionSchema)

export default Section
