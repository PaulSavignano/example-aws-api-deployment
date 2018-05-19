import {
  alignItems,
  items,
  typographies,
  color,
  size,
} from '../utils/options'

const itemsSchema = [{
  kind: { type: String, trim: true, maxlength: 90, enum: items },
  iframe: {
    elevation: { type: String, trim: true, max: 25, min: 0 },
    src: { type: String, trim: true, maxlength: 300 },
    style: {
      border: { type: String, trim: true, maxlength: 300 },
      borderRadius: { type: String, trim: true, maxlength: 300 },
      flex: { type: String, trim: true, maxlength: 300 },
    },
  },
  image: {
    elevation: { type: Number, trim: true, max: 25, min: 0 },
    src: { type: String, trim: true, maxlength: 300 },
    style: {
      border: { type: String, trim: true, maxlength: 300 },
      borderRadius: { type: String, trim: true, maxlength: 300 },
      flex: { type: String, trim: true, maxlength: 90 },
      margin: { type: String, trim: true, maxlength: 90 },
    }
  },
  button: {
    children: { type: String, trim: true, maxlength: 300 },
    color: { type: String, enum: color },
    href: { type: String, trim: true, maxlength: 300 },
    size: { type: String, enum: size },
    style: {
      flex: { type: String, trim: true, maxlength: 90 },
    },
  },
  typographies: [{
    children: { type: String, trim: true, maxlength: 3000 },
    variant: { type: String, enum: typographies },
  }],
  wysiwyg: {
    children: { type: String, trim: true, maxlength: 9000 },
    style: {
      flex: { type: String, trim: true, maxlength: 90 },
      padding: { type: String, trim: true, maxlength: 90 },
    }
  },
  style: {
    color: { type: String, trim: true, maxlength: 90 },
    flex: { type: String, trim: true, maxlength: 90 },
    textAlign: { type: String, enum: alignItems },
  },
}]

export default itemsSchema
