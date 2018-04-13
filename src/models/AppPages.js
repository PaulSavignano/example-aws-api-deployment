import mongoose, { Schema } from 'mongoose'

const appPagesSchema = new Schema({
  appName: { type: String, maxlength: 90, required: true, unique: true },
  pages: [{ type: Schema.Types.ObjectId, ref: 'Page' }],
},{
  timestamps: true
})

const AppPages = mongoose.model('AppPages', appPagesSchema)

export default AppPages
