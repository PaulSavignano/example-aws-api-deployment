import { ObjectID } from 'mongodb'

import Address from '../models/Address'
import User from '../models/User'

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

  const user = await User.findOneAndUpdate(
    { _id: address.user, brandName },
    { $push: { addresses: address._id }},
    { new: true }
  )
  .populate({ path: 'addresses' })

  return res.send({ user })
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

  const user = await User.findOneAndUpdate(
    { _id: address.user, brandName },
    { $push: { addresses: address._id }},
    { new: true }
  )
  .populate('addresses')

  return res.send(user)
}




export const get = async (req, res) => {
  const {
    params: { brandName },
    user
  } = req
  const isAdmin = user.roles.some(role => role === 'admin')
  if (isAdmin) {
    const addresses = await Address.find({ brandName })
    if (!addresses) throw 'No addresses found'
    return res.send(addresses)
  }
  const address = await Address.find({ user: user._id, brandName })
  if (!address) throw 'No address found'
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
  const user = await User.findOne({ _id: address.user, brandName })
  return res.send(user)
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

  const user = await User.findOne({ _id: address.user, brandName })
  return res.send(user)
}




export const remove = async (req, res) => {
  const {
    params: { _id, brandName }
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Address remove failed, invalid id')
  const address = await Address.findOneAndRemove({ _id })
  await User.findOneAndUpdate(
    { _id: address.user, brandName },
    { $pull: { addresses:  address._id }},
    { new: true }
  )
  const user = await User.findOne({ _id: req.user._id, brandName })
  return res.send({ user })
}

export const adminRemove = async (req, res) => {
  const {
    params: { _id, brandName, userId },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('Address remove failed, invalid id')
  const address = await Address.findOneAndRemove({ _id, brandName })
  const user = await User.findOneAndUpdate(
    { _id: address.user, brandName },
    { $pull: { addresses:  address._id }},
    { new: true }
  )
  return res.send({ address, user })
}
