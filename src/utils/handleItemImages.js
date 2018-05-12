import { uploadFile } from './s3'
import getTime from './getTime'
import { ObjectID } from 'mongodb'

const handleItemImages = async ({
  _id,
  appName,
  items,
  pageSlug,
  kind,
}) => {
  const newItems = items.map(async item => {
    if (item.image && item.image.src && item.image.src.indexOf('data') !== -1) {
      const itemId = new ObjectID()
      const src = await uploadFile({
        Key: `${appName}/page-${pageSlug}/${kind}-${_id}-${item.kind}-${itemId}_${getTime()}.${item.image.ext}`,
        Body: new Buffer(item.image.src.replace(/^data:image\/\w+;base64,/, ""),'base64'),
      })
      return {
        kind: item.kind,
        _id: itemId,
        image: {
          src,
          style: item.image.style
        }
      }
    }
    return item
  })
  return Promise.all(newItems).then(newItems => {
    return newItems
  }).catch(error => Promise.reject(error))
}

export default handleItemImages
