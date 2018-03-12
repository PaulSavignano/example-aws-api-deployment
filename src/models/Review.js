import mongoose, { Schema } from 'mongoose'

const ReviewSchema = new Schema({
  brandName: { type: String, maxlength: 90, required: true },
  user: { type: Schema.ObjectId, ref: 'User' },
  kind: {
    kind: { type: String, trim: true },
    kindId: { type: Schema.ObjectId, refPath: 'item.kind' }
  },
  values: {
    text: { type: String, maxlength: 9000 },
    rating: { type: Number, min: 1, max: 5 }
  }
}, {
  timestamps: true
})

function autopopulate(next) {
  this.populate({ path: 'user', select: '-_id -roles -addresses' })
  next()
}

ReviewSchema.pre('find', autopopulate);
ReviewSchema.pre('findOne', autopopulate)

const Review = mongoose.model('Review', ReviewSchema)

export default Review