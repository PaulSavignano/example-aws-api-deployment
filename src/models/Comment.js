import mongoose, { Schema } from 'mongoose'

const CommentSchema = new Schema({
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

CommentSchema.pre('find', autopopulate);
CommentSchema.pre('findOne', autopopulate)
CommentSchema.pre('save', autopopulate)


const Comment = mongoose.model('Comment', CommentSchema)

export default Comment
