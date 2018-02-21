import { ObjectID } from 'mongodb'

import ApiConfig from '../models/ApiConfig'

export const add = async (req, res) => {
  const {
    body: { values },
    params: { brandName }
  } = req
  const apiConfig = new ApiConfig({ values, brandName })
  return res.send(apiConfig)
}




export const get = async (req, res) => {
  const { brandName } = req.params
  const config = await ApiConfig.findOne({ brandName })
  if (!config) throw Error('No config found')
  return res.send(config)
}




export const update = async (req, res) => {
  if (!ObjectID.isValid(req.params._id)) return res.status(404).send({ error: 'Invalid id' })
  const {
    body: { values },
    params: { _id, brandName },
  } = req
  const config = await ApiConfig.findOneAndUpdate(
    { _id, brandName },
    { $set: { values }},
    { new: true }
  )
  if (!config) throw Error('Update failed, could not find the config')
  return res.send(config)
}



export const remove = async (req, res) => {
  if (!ObjectID.isValid(req.params._id)) return res.status(404).send({ error: 'Invalid id'})
  const {
    params: { _id, brandName }
  } = req
  const config = await ApiConfig.findOneAndRemove({ _id, brandName })
  if (!config) throw Error('No api config found')
  return res.send(config._id)
}
