import mongoose, { Schema } from 'mongoose'

const commentSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  user: { type: Schema.ObjectId, ref: 'User' },
  review: { type: Schema.ObjectId, ref: 'Review' },
  parent: { type: Schema.ObjectId, ref: 'Comment' },
  likes: [{ type: Schema.ObjectId, ref: 'User' }],
  disLikes: [{ type: Schema.ObjectId, ref: 'User' }],
  values: {
    text: { type: String, maxlength: 9000 },
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

commentSchema.pre('find', autopopulate);
commentSchema.pre('findOne', autopopulate)
commentSchema.pre('save', autopopulate)


const Comment = mongoose.model('Comment', commentSchema)

export default Comment
