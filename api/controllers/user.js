import { ObjectID } from 'mongodb'
import bcrypt from 'bcryptjs'

import createToken from '../utils/createToken'
import Address from '../models/Address'
import Brand from '../models/Brand'
import Order from '../models/Order'
import ResetToken from '../models/ResetToken'
import User from '../models/User'
import sendGmail from '../utils/sendGmail'
import createTokens from '../utils/createTokens'
import createUserResponse from '../utils/createUserResponse'
import ErrorObject from '../utils/ErrorObject'

export const add = async (req, res) => {
  const {
    body: {
      email,
      firstName,
      lastName,
      password
    },
    params: { brandName }
  } = req
  if ( !email || !firstName || !firstName || !password) throw Error('You must provide all fields')
  const existingUser = await User.findOne({ 'values.email': email.toLowerCase(), brandName })
  if (existingUser) throw new ErrorObject({ email: 'That user already exists', status: 400 })
  const user = await new User({
    brandName,
    password,
    values: { email: email.toLowerCase(), firstName, lastName }
  }).save()

  const { newAccessToken, newRefreshToken } = await createTokens(user, brandName)
  const { values } = user
  res.set('x-access-token', newAccessToken)
  res.set('x-refresh-token', newRefreshToken)
  res.send({ user })
  return sendGmail({
    brandName,
    to: values.email,
    toSubject: `Welcome to ${brandName}!`,
    toBody: `
      <p>Hi ${values.firstName},</p>
      <p>Thank you for joining ${brandName}!</p>
      <p>I hope you enjoy our offerings.  You may modify your profile settings at <a href="${brandName}/user/profile">${brandName}/user/profile</a>.</p>
      <p>Please let us know if there is anything we can do to better help you.</p>
    `,
    fromSubject: `New ${brandName} user!`,
    fromBody: `
      <p>New user ${values.firstName} ${values.lastName} just signed up at ${brandName}.</p>
      `
  })
}




export const get = async (req, res) => {
  const {
    params: { brandName },
  } = req
  const { user, users, orders } = await createUserResponse(req.user, brandName)
  return res.send({ user, users, orders })
}






export const update = async (req, res) => {
  const {
    body: { type, values },
  } = req
  req.user.values = {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email.toLowerCase(),
    phone: values.phone
  }
  const user = await req.user.save()
  return res.send(user)
}




export const remove = async (req, res) => {
  const { params: { brandName }} = req
  const user = await User.findOne(
    { _id: req.user._id, brandName }
  )
  await user.remove()
  return res.status(200).send(user._id)
}




export const signin = async (req, res) => {
  const {
    body: { email, password },
    params: { brandName }
  } = req
  const user = await User.findOne({ 'values.email': email.toLowerCase(), brandName })
  if (!user) throw new ErrorObject({ email: 'Email not found', status: 404 })
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new ErrorObject({ password: 'Password does not match', status: 404 })
  const { newAccessToken, newRefreshToken } = await createTokens(user, brandName)
  const response = await createUserResponse(user, brandName)
  res.set('x-access-token', newAccessToken);
  res.set('x-refresh-token', newRefreshToken);
  return res.send(response)
}




export const recovery = async (req, res, next) => {
  const {
    body,
    params: { brandName }
  } = req
  const resetToken = await createToken()
  const user = await User.findOne({ 'values.email': body.email.toLowerCase(), brandName })
  if (!user) throw new ErrorObject({ email: 'User not found', status: 404 })
  const path = `${brandName}user/reset/${resetToken}`
  const newResetToken = await new ResetToken({
    brandName,
    resetToken,
    user: user._id
  }).save()

  const { firstName, email } = user.values
  sendGmail({
    brandName,
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
    params: { brandName, resetToken }
  } = req
  const { user } = await ResetToken.findOne({ resetToken, brandName }).populate('user')
  if (!user) throw Error('your reset token has expired')
  user.password = password
  await user.save()
  const { newAccessToken, newRefreshToken } = await createTokens(user, brandName)
  const response = await createUserResponse(user, brandName)
  res.set('x-access-token', newAccessToken);
  res.set('x-refresh-token', newRefreshToken);
  return res.send(response)
}




export const contact = async (req, res) => {
  const {
    body: {
      email,
      firstName,
      message,
      phone
    },
    params: { brandName }
  } = req
  if (!firstName || !email || !message) throw Error('All fields are required')
  const brand = await Brand.findOne({ brandName })
  if (!brand) throw Error('Contact failed')
  const { name } = brand.business.values
  const into = await sendGmail({
    brandName,
    to: email,
    toSubject: `Thank you for contacting ${name}!`,
    name: firstName,
    toBody: `<p>Thank you for contacting ${name}.  We will respond to your request shortly!</p>`,
    fromSubject: `New Contact Request`,
    fromBody: `
      <p>${firstName} just contacted you through ${brandName}.</p>
      <div>Phone: ${phone ? phone : 'not provided'}</div>
      <div>Email: ${email}</div>
      <div>Message: ${message}</div>
    `
  })
  if (!info) throw Error('Contact email send failed')
  return res.send({ message: 'Thank you for contacting us, we will respond to you shortly!'})
}
