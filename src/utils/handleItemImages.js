import handleImage from './handleImage'
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
      return {
        kind: item.kind,
        _id: itemId,
        image: await handleImage({
          path: `${appName}/page-${pageSlug}/${kind}-${_id}-${item.kind}-${itemId}_${getTime()}.${item.image.ext}`,
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
