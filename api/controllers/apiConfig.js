import { ObjectID } from 'mongodb'

import ApiConfig from '../models/ApiConfig'

export const add = async (req, res) => {
  const {
    body: { values },
    params: { brandName }
  } = req
  const newDoc = new ApiConfig({ values, brandName })
  newDoc.save()
  .then(doc => res.send(doc))
  .catch(error => { console.error(error); res.status(400).send({ error })})
}

export const get = async (req, res) => {
  const { brandName } = req.params
  try {
    const config = await ApiConfig.findOne({ brandName })
    if (!config) throw 'No config found'
    res.send(config)
  } catch (error) {
    console.error(error)
    res.status(400).send({ error })
  }
}


export const update = async (req, res) => {
  if (!ObjectID.isValid(req.params._id)) return res.status(404).send({ error: 'Invalid id' })
  const {
    body: { values },
    params: { _id, brandName },
  } = req
  try {
    const config = await ApiConfig.findOneAndUpdate(
      { _id, brandName },
      { $set: { values }},
      { new: true }
    )
    if (!config) throw 'Update failed, could not find the config'
    res.send(config)
  } catch (error) {
    console.error(error)
    res.status(400).send({ error })
  }
}



export const remove = async (req, res) => {
  if (!ObjectID.isValid(req.params._id)) return res.status(404).send({ error: 'Invalid id'})
  const {
    params: { _id, brandName }
  } = req
  ApiConfig.findOneAndRemove({ _id, brandName })
  .then(doc => res.send(doc._id))
  .catch(error => { console.error(error); res.status(400).send({ error })})
}
