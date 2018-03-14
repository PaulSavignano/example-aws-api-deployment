import { ObjectID } from 'mongodb'

import Address from '../models/Address'
import User from '../models/User'

const limit = 9


export const add = async (req, res) => {
  const {
    body,
    params: { brandName },
  } = req
  const address = await new Address({
    brandName,
    user: ObjectID(req.user._id),
    values: body
  }).save()
  return res.send(address)
}



export const adminAdd = async (req, res) => {
  const {
    body,
    params: { brandName, userId },
  } = req
  const address = await new Address({
    brandName,
    user: ObjectID(userId),
    values: body
  }).save()
  return res.send(address)
}







export const get = async (req, res) => {
  const {
    params: { brandName },
    query: { lastId, limit, addressId },
    user
  } = req

  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const idQuery = addressId && { _id: addressId }
  const query = {
    brandName,
    user: user._id,
    ...lastIdQuery,
    ...idQuery,
  }
  const addresses = await Address.find(query)
  .limit(parseInt(limit))
  return res.send(addresses)
}


export const adminGet = async (req, res) => {
  const {
    params: { brandName },
    query: { lastId, limit, addressId, userId },
  } = req
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const idQuery = addressId && { _id: addressId }
  const userQuery = userId && { user: userId }
  const addresses = await Address.find({
    brandName,
    user: user._id,
    ...lastIdQuery,
    ...idQuery,
    ...userQuery,
  })
  .limit(parseInt(limit))
  return res.send(addresses)
}










export const update = async (req, res) => {
  const {
    body: {
      values
    },
    params: { _id, brandName },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Update address failed, invalid id')
  const address = await Address.findOneAndUpdate(
    { _id, user: req.user._id, brandName },
    { $set: { values }},
    { new: true }
  )
  return res.send(address)
}



export const adminUpdate = async (req, res) => {
  const {
    body: { values },
    params: { _id, brandName },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Address update failed, invalid id')
  const isOwner = req.user.roles.some(role => role === 'owner')
  if (!isOwner) throw Error('Update address failed, unauthorized')
  const address = await Address.findOneAndUpdate(
    { _id, brandName },
    { $set: { values }},
    { new: true }
  )
  return res.send(address)
}




export const remove = async (req, res) => {
  const {
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Address remove failed, invalid id')
  const address = await Address.findOneAndRemove({ _id })
  return res.send(addresss)
}




export const adminRemove = async (req, res) => {
  const {
    params: { _id, brandName, userId },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Address remove failed, invalid id')
  const isOwner = req.user.roles.some(role => role === 'owner')
  if (!isOwner) throw Error('Update address failed, unauthorized')
  const address = await Address.findOneAndRemove({ _id, brandName })
  return res.send(address._id)
}
