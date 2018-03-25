import mongoose, { Schema } from 'mongoose'

const CommentSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  user: { type: Schema.ObjectId, ref: 'User' },
  text: { type: String, maxlength: 9000 },
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

CommentSchema.pre('find', autopopulate);
CommentSchema.pre('findOne', autopopulate)
CommentSchema.pre('save', autopopulate)

const Comment = mongoose.model('Comment', CommentSchema)

export default Comment
