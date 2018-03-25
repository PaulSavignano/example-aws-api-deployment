import { ObjectID } from 'mongodb'
import bcrypt from 'bcryptjs'

import Address from '../models/Address'
import Brand from '../models/Brand'
import createToken from '../utils/createToken'
import createTokens from '../utils/createTokens'
import CustomError from '../utils/CustomError'
import Order from '../models/Order'
import ResetToken from '../models/ResetToken'
import sendGmail from '../utils/sendGmail'
import User from '../models/User'

export const add = async (req, res) => {
  const {
    body: {
      email,
      firstName,
      lastName,
      password
    },
    appName
  } = req
  if ( !email || !firstName || !firstName || !password) throw Error('You must provide all fields')
  const existingUser = await User.findOne({ 'values.email': email.toLowerCase(), appName })
  if (existingUser) throw new CustomError({ field: 'email', message: 'That user already exists', statusCode: 400 })
  const user = await new User({
    appName,
    password,
    values: { email: email.toLowerCase(), firstName, lastName }
  }).save()

  const { newAccessToken, newRefreshToken } = await createTokens(user, appName)
  const { values } = user
  res.set('x-access-token', newAccessToken)
  res.set('x-refresh-token', newRefreshToken)
  res.send(user)
  return sendGmail({
    appName,
    to: values.email,
    toSubject: `Welcome to ${appName}!`,
    toBody: `
      <p>Hi ${values.firstName},</p>
      <p>Thank you for joining ${appName}!</p>
      <p>I hope you enjoy our offerings.  You may modify your profile settings at <a href="${appName}/user/profile">${appName}/user/profile</a>.</p>
      <p>Please let us know if there is anything we can do to better help you.</p>
    `,
    fromSubject: `New ${appName} user!`,
    fromBody: `
      <p>New user ${values.firstName} ${values.lastName} just signed up at ${appName}.</p>
      `
  })
}




export const get = async (req, res) => {
  const {
    appName,
    user
  } = req
  return res.send(user)
}






export const update = async (req, res) => {
  const {
    body: { values },
  } = req
  req.user.values = values
  const user = await req.user.save()
  return res.send(user)
}



export const updateAddresses = async (req, res) => {
  const {
    body: { addresses },
    appName,
  } = req
  const user = await User.findOneAndUpdate(
    { _id: req.user._id, appName },
    { $set: { addresses }},
    { new: true }
  )
  if (!user) throw Error('Page set sections failed')
  return res.send(user)
}




export const remove = async (req, res) => {
  const { appName } = req
  const user = await User.findOne({ _id: req.user._id, appName })
  await user.remove()
  return res.status(200).send(user._id)
}




export const signin = async (req, res) => {
  const {
    body: { email, password },
    appName
  } = req
  const user = await User.findOne({ 'values.email': email.toLowerCase(), appName })
  if (!user) throw new CustomError({ field: 'email', message: 'Email not found', statusCode: 404 })
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new CustomError({ field: 'password', message: 'Password does not match', statusCode: 404 })
  const { newAccessToken, newRefreshToken } = await createTokens(user, appName)
  res.set('x-access-token', newAccessToken);
  res.set('x-refresh-token', newRefreshToken);
  return res.send(user)
}




export const recovery = async (req, res, next) => {
  const {
    body,
    appName
  } = req
  const resetToken = await createToken()
  const user = await User.findOne({ 'values.email': body.email.toLowerCase(), appName })
  if (!user) throw new CustomError({ field: 'email', message: 'User not found', statusCode: 404 })
  const path = `${appName}/user/reset/${resetToken}`
  const newResetToken = await new ResetToken({
    appName,
    resetToken,
    user: user._id
  }).save()
  const { firstName, email } = user.values
  sendGmail({
    appName,
    to: email,
    toSubject: 'Reset Password',
    toBody: `
      <p>Hi ${firstName},</p>
      <p>Click the link below to recover your password.</p>
      <a href="${path}" style="color: black; text-decoration: none;">
        ${path}
      </a>
      `
  })
  return res.send({ message: `A password recovery email has been sent to ${email}.`})
}






export const reset = async (req, res) => {
  const {
    body: { password },
    appName,
    params: { resetToken }
  } = req
  const token = await ResetToken.findOne({ resetToken, appName }).populate('user')
  const { user } = token
  if (!user) throw Error('your reset token has expired')
  user.password = password
  await user.save()
  const { newAccessToken, newRefreshToken } = await createTokens(user, appName)
  res.set('x-access-token', newAccessToken);
  res.set('x-refresh-token', newRefreshToken);
  return res.send(user)
}




export const contact = async (req, res) => {
  const {
    body: {
      email,
      firstName,
      message,
      phone
    },
    appName
  } = req
  if (!firstName || !email || !message) throw Error('All fields are required')
  const brand = await Brand.findOne({ appName })
  if (!brand) throw Error('Contact failed')
  const { name } = brand.business.values
  const into = await sendGmail({
    appName,
    to: email,
    toSubject: `Thank you for contacting ${name}!`,
    name: firstName,
    toBody: `<p>Thank you for contacting ${name}.  We will respond to your request shortly!</p>`,
    fromSubject: `New Contact Request`,
    fromBody: `
      <p>${firstName} just contacted you through ${appName}.</p>
      <div>Phone: ${phone ? phone : 'not provided'}</div>
      <div>Email: ${email}</div>
      <div>Message: ${message}</div>
    `
  })
  if (!info) throw Error('Contact email send failed')
  return res.send({ message: 'Thank you for contacting us, we will respond to you shortly!'})
}
