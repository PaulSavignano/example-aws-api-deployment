import { ObjectID } from 'mongodb'

import Address from '../models/Address'
import User from '../models/User'


export const add = async (req, res) => {
  const {
    body: { values },
    appName,
    user,
  } = req
  const address = await new Address({
    appName,
    user: ObjectID(user._id),
    values
  }).save()
  const updateUser = await User.findOneAndUpdate(
    { _id: user._id, appName },
    { $push: { addresses: address._id }},
    { new: true }
  )
  return res.send(address)
}



export const adminAdd = async (req, res) => {
  const {
    body,
    params: { userId },
    appName,
  } = req
  const address = await new Address({
    appName,
    user: ObjectID(userId),
    values: body
  }).save()
  return res.send(address)
}







export const get = async (req, res) => {
  const {
    appName,
    query: { lastId, limit, addressId },
    user
  } = req
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const idQuery = addressId && { _id: addressId }
  const query = {
    appName,
    user: user._id,
    ...lastIdQuery,
    ...idQuery,
  }
  if (addressId) {
    const address = await Address.findOne(query)
    return res.send(address)
  }
  const addresses = await Address.find(query)
  .limit(parseInt(limit))
  return res.send(addresses)
}



export const adminGet = async (req, res) => {
  const {
    appName,
    query: { lastId, limit, addressId, userId },
  } = req
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const idQuery = addressId && { _id: addressId }
  const userQuery = userId && { user: userId }
  const query = {
    appName,
    ...lastIdQuery,
    ...idQuery,
    ...userQuery,
  }
  if (addressId) {
    const address = await Address.findOne(query)
    return res.send(address)
  }
  const addresses = await Address.find(query)
  .limit(parseInt(limit))
  return res.send(addresses)
}











export const update = async (req, res) => {
  const {
    body: { values },
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Update address failed, invalid id')
  const address = await Address.findOneAndUpdate(
    { _id, user: req.user._id, appName },
    { $set: { values }},
    { new: true }
  )
  return res.send(address)
}



export const adminUpdate = async (req, res) => {
  const {
    body: { values },
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Address update failed, invalid id')
  const isOwner = req.user.roles.some(role => role === 'owner')
  if (!isOwner) throw Error('Update address failed, unauthorized')
  const address = await Address.findOneAndUpdate(
    { _id, appName },
    { $set: { values }},
    { new: true }
  )
  return res.send(address)
}




export const remove = async (req, res) => {
  const {
    appName,
    params: { _id },
    user,
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Address remove failed, invalid id')
  const address = await Address.findOneAndRemove({ _id })
  const updateUser = await User.findOneAndUpdate(
    { _id: user._id, appName },
    { $pull: { addresses: address._id }},
    { new: true }
  )
  return res.send(address)
}




export const adminRemove = async (req, res) => {
  const {
    appName,
    params: { _id, userId },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Address remove failed, invalid id')
  const address = await Address.findOneAndRemove({ _id, appName })
  const updateUser = await User.findOneAndUpdate(
    { _id: userId, appName },
    { $pull: { addresses: address._id }},
    { new: true }
  )
  return res.send(address._id)
}
