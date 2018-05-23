import AWS from 'aws-sdk'

const s3 = new AWS.S3()


AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  subregion: 'us-west-2',
})

const Bucket = process.env.AWS_S3_BUCKET



export const uploadFile = ({ Key, Body }) => {
  const params = {
    ACL: 'public-read',
    Body,
    Bucket,
    Key,
  }
  return s3.upload(params).promise()
    .then(data => {
      console.info('s3 uploadImage success!: ', data)
      return Key
    })
    .catch(error => {
      console.error('s3 uploadImage error: ', error)
      return Promise.reject(error)
    })
}




export const deleteFile = ({ Key }) => {
  const params = { Bucket, Key }
  return s3.deleteObject(params).promise()
    .then(data => {
      console.info('s3 deleteObject success!: ', data)
      return data
    })
    .catch(error => {
      console.error('s3 deleteObject error: ', error)
      return Promise.reject(error)
    })
}





export const deleteFiles = (objects) => {
  const params = {
    Bucket,
    Delete: {
      Objects: objects
    }
  }
  return s3.deleteObjects(params).promise()
    .then(data => {
      console.info('s3 deleteFiles success!: ', data)
      return data
    })
    .catch(error => {
      console.error('s3 deleteFiles error: ', error)
      return Promise.reject(Error(error))
    })
}
