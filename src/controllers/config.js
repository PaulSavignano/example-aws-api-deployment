import { ObjectID } from 'mongodb'

import Config from '../models/Config'

export const add = async (req, res) => {
  const {
    body: { values },
    params: { brandName }
  } = req
  const config = new Config({ values, brandName })
  return res.send(config)
}


export const get = async (req, res) => {
  const { brandName } = req.params
  const config = await Config.findOne({ brandName })
  if (!config) throw Error('No config found')
  return res.send(config)
}


export const update = async (req, res) => {
  if (!ObjectID.isValid(req.params._id)) return res.status(404).send({ error: 'Invalid id' })
  const {
    body: { values },
    params: { _id, brandName },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Config update failed, Invalid id')
  const config = await Config.findOneAndUpdate(
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
  const config = await Config.findOneAndRemove({ _id, brandName })
  if (!config) throw Error('No api config found')
  return res.send(config._id)
}
