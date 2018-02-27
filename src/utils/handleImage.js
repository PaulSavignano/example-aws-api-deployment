import { uploadFile } from './s3'

const handleImage = async ({
  path,
  image,
}) => {
  try {
    const data = await uploadFile({
      Key: path,
      src: image.src,
    })
    if (!data) throw Error('Upload to s3 failed')

    const {
      backgroundPosition,
      border,
      borderRadius,
      elevation,
      flex,
      margin,
    } = image

    const props = {
      backgroundPosition,
      border,
      borderRadius,
      elevation,
      flex,
      margin,
    }

    Object.keys(props).map(key => props[key] === undefined && delete props[key])

    const newImage = {
      ...props,
      src: path
    }

    return Promise.resolve(newImage)
  } catch (error) {
    return Promise.reject(error)
  }

}

export default handleImage
