import { ObjectID } from 'mongodb'
import crypto from 'crypto'

import Address from '../models/Address'
import Brand from '../models/Brand'
import CustomError from '../utils/CustomError'
import Order from '../models/Order'
import User from '../models/User'

export const adminAdd = async (req, res) => {
  const {
    body: {
      email,
      firstName,
      lastName,
      password
    },
    params: { brandName }
  } = req
  if ( !email || !firstName || !firstName || !password) throw Error('User add failed, all fields are required')
  const existingUser = await User.findOne({ 'values.email': email, brandName })
  if (existingUser) throw new CustomError({ field: 'email', message: 'That user email already exists', statusCode: 400 })
  const user = await new User({
    brandName,
    password,
    values: { email, firstName, lastName }
  }).save()
  return res.send(user)
}




export const adminGet = async (req, res) => {
  const {
    params: { brandName },
    query: { lastId, limit, userId },
  } = req
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const userQuery = userId && { _id: userId }
  const query = {
    brandName,
    ...lastIdQuery,
    ...userQuery,
  }
  if (userId) {
    const user = await User.findOne(query)
    return res.send(user)
  }
  const users = await User.find(query)
  .limit(parseInt(limit))
  return res.send(users)
}


export const adminUpdateValues = async (req, res) => {
  const {
    body: { values, type },
    params: { _id, brandName },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('User update failed, invalid id')
  const existingUser = await User.findOne({ _id, brandName })
  if (!existingUser) throw Error('User updated failed, user not found')
  const updatedUser = await User.findOneAndUpdate(
    { _id, brandName },
    { $set: { values }},
    { new: true }
  )
  return res.send(updatedUser)
}


export const adminUpdateRoles = async (req, res) => {
  const {
    body: { values, type },
    params: { _id, brandName },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('User update failed, invalid id')
  const existingUser = await User.findOne({ _id, brandName })
  if (!existingUser) throw Error('User updated failed, user not found')
  const roles = values.owner ?
    [ 'admin', 'owner', 'user' ]
    :
    values.admin ?
    [ 'admin', 'user' ]
    :
    [ 'user' ]
  const user = await User.findOneAndUpdate(
    { _id },
    { $set: { roles: roles }},
    { new: true }
  )
  return res.send(user)
}






export const adminRemove = async (req, res) => {
  const {
    params: { _id, brandName }
  } = req
  const user = await User.findOne({ _id, brandName })
  await user.remove()
  return res.send(user._id)
}
