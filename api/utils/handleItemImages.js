import handleImage from './handleImage'
import formatDate from './formatDate'
import { ObjectID } from 'mongodb'

const handleItemImages = async ({
  _id,
  brandName,
  items,
  pageSlug,
  kind,
}) => {
  const newItems = items.map(async item => {
    if (item.image && item.image.src && item.image.src.indexOf('data') !== -1) {
      const itemId = new ObjectID()
      return {
        kind: item.kind,
        _id: itemId,
        image: await handleImage({
          path: `${brandName}/${pageSlug}/${kind}-${_id}-${item.kind}-${itemId}_${formatDate(new Date())}.${item.image.ext}`,
          image: item.image,
        })
      }
    }
    return item
  })
  return Promise.all(newItems).then(newItems => {
    return newItems
  }).catch(error => Promise.reject(error))
}

export default handleItemImages
