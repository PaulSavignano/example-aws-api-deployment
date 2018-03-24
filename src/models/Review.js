import mongoose, { Schema } from 'mongoose'

const ReviewSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  item: { type: Schema.ObjectId, refPath: 'kind' },
  kind: { type: String, trim: true },
  published: { Type: Boolean, default: false },
  user: { type: Schema.ObjectId, ref: 'User' },
  values: {
    text: { type: String, maxlength: 9000 },
    rating: { type: Number, min: 1, max: 5 }
  }
}, {
  timestamps: true
})

function autopopulate(next) {
  this.populate({
    path: 'user',
    select: 'values.firstName _id'
  })
  next()
}

ReviewSchema.pre('find', autopopulate);
ReviewSchema.pre('findOne', autopopulate)
ReviewSchema.pre('save', autopopulate)

const Review = mongoose.model('Review', ReviewSchema)

export default Review
