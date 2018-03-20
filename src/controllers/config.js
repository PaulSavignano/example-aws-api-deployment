import { ObjectID } from 'mongodb'

import Config from '../models/Config'

export const add = async (req, res) => {
  const {
    appName,
    body: { values },
  } = req
  const config = new Config({ values, appName })
  return res.send(config)
}


export const get = async (req, res) => {
  const { appName } = req
  const config = await Config.findOne({ appName })
  if (!config) throw Error('No config found')
  return res.send(config)
}


export const update = async (req, res) => {
  if (!ObjectID.isValid(req.params._id)) return res.status(404).send({ error: 'Invalid id' })
  const {
    body: { values },
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Config update failed, Invalid id')
  const config = await Config.findOneAndUpdate(
    { _id, appName },
    { $set: { values }},
    { new: true }
  )
  if (!config) throw Error('Update failed, could not find the config')
  return res.send(config)
}



export const remove = async (req, res) => {
  if (!ObjectID.isValid(req.params._id)) return res.status(404).send({ error: 'Invalid id'})
  const {
    appName,
    params: { _id }
  } = req
  const config = await Config.findOneAndRemove({ _id, appName })
  if (!config) throw Error('No api config found')
  return res.send(config._id)
}
