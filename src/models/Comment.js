import mongoose, { Schema } from 'mongoose'

const CommentSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true },
  user: { type: Schema.ObjectId, ref: 'User' },
  review: { type: Schema.ObjectId, ref: 'Review' },
  parent: { type: Schema.ObjectId, ref: 'Comment' },
  text: { type: String, maxlength: 9000 },
}, {
  timestamps: true
})


const Comment = mongoose.model('Comment', CommentSchema)

export default Comment
