import { ObjectID } from 'mongodb'

import CustomError from '../utils/CustomError'
import User from '../models/User'



export const adminAdd = async (req, res) => {
  const {
    body: {
      email,
      firstName,
      lastName,
      password
    },
    appName
  } = req
  if ( !email || !firstName || !firstName || !password) throw Error('User add failed, all fields are required')
  const existingUser = await User.findOne({ 'values.email': email, appName })
  if (existingUser) throw new CustomError({ field: 'email', message: 'That user email already exists', statusCode: 400 })
  const user = await new User({
    appName,
    password,
    values: { email, firstName, lastName }
  }).save()
  return res.send(user)
}






export const adminGet = async (req, res) => {
  const {
    appName,
    query: { lastId, limit, userId },
  } = req
  const lastIdQuery = lastId && { _id: { $gt: lastId }}
  const userQuery = userId && { _id: userId }
  const query = {
    appName,
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
    body: { values },
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('User update failed, invalid _id')
  const existingUser = await User.findOne({ _id, appName })
  if (!existingUser) throw Error('User updated failed, user not found')
  const updatedUser = await User.findOneAndUpdate(
    { _id, appName },
    { $set: { values }},
    { new: true }
  )
  return res.send(updatedUser)
}




export const adminUpdatePassword = async (req, res) => {
  const {
    body: { password },
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('User update failed, invalid _id')
  const userDoc = await User.findOne({ _id, appName })
  if (!userDoc) throw Error('User updated failed, user not found')
  userDoc.password = password
  const user = await userDoc.save()
  return res.send(user)
}






export const adminUpdateRoles = async (req, res) => {
  const {
    body: { values },
    appName,
    params: { _id },
  } = req
  if (!ObjectID.isValid(_id)) throw Error('User update failed, invalid _id')
  const existingUser = await User.findOne({ _id, appName })
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






export const adminUpdateAddresses = async (req, res) => {
  const {
    body: { addresses },
    appName,
    params: { _id }
  } = req
  const userUpdate = await User.findOneAndUpdate(
    { _id, appName },
    { $set: { addresses }},
    { new: true }
  )
  if (!userUpdate) throw Error('Admin set user addresses failed')
  return res.send(userUpdate)
}






export const adminRemove = async (req, res) => {
  const {
    appName,
    params: { _id }
  } = req
  const user = await User.findOne({ _id, appName })
  await user.remove()
  return res.send(user._id)
}
