import mongoose, { Schema } from 'mongoose'

const reviewSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  item: { type: Schema.ObjectId, refPath: 'kind' },
  kind: { type: String, trim: true },
  published: { type: Boolean, default: false },
  user: { type: Schema.ObjectId, ref: 'User' },
  likes: [{ type: Schema.ObjectId, ref: 'User' }],
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
    select: 'values.firstName values.lastName _id'
  })
  next()
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate)

const Review = mongoose.model('Review', reviewSchema)

export default Review
