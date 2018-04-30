import bcrypt from 'bcryptjs'
import crypto from 'crypto'

import createTokens from '../utils/createTokens'
import CustomError from '../utils/CustomError'
import AccessToken from '../models/AccessToken'
import RefreshToken from '../models/RefreshToken'
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
  await sendGmail({
    appName,
    toEmail: values.email,
    toSubject: `Welcome to ${appName}!`,
    toBody: `
      <p>Hi ${values.firstName},</p>
      <p>Thank you for joining ${appName}!</p>
      <p>You may edit your account settings at <a href="${appName}/user/account">${appName}/user/account</a>.</p>
      <p>Please let us know if there is anything we can do to better help you.</p>
    `,
    adminSubject: `New ${appName} user!`,
    adminBody: `
      <p>New ${appName} user!</p>
      <div>First Name: ${values.firstName}</div>
      <div>Last Name: ${values.lastName}</div>
      <div>Email: ${values.email}</div>
      <div>Phone: ${values.phone ? values.phone : 'phone number not provided'}</div>
    `
  })
}






export const get = async (req, res) => {
  const { user } = req
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






export const signout = async (req, res) => {
  const accessToken = req.headers['x-access-token']
  const refreshToken = req.headers['x-refresh-token']

  const aTokenPromise = AccessToken.findOneAndRemove({ accessToken })
  const rTokenPromise = RefreshToken.findOneAndRemove({ refreshToken })

  const [ aToken, rToken ] = await Promise.all([ aTokenPromise, rTokenPromise ])
  if (!aToken) throw Error('Signout access token not found')
  if (!rToken) throw Error('Signout refresh token not found')
  return res.status(200).send({ message: 'It was good seeing you, come back soon!'})
}






export const recovery = async (req, res) => {
  const {
    body,
    appName
  } = req
  const resetTokenPromise = crypto.randomBytes(30).toString('hex')
  const userPromise = User.findOne({ 'values.email': body.email.toLowerCase(), appName })
  const [ resetToken, user ] = await Promise.all([ resetTokenPromise, userPromise ])
  if (!user) throw new CustomError({ field: 'email', message: 'User not found', statusCode: 404 })
  const path = `${appName}/user/reset/${resetToken}`
  await new ResetToken({
    appName,
    resetToken,
    user: user._id
  }).save()
  const { firstName, email } = user.values

  res.send({ message: `A password recovery email has been sent to ${email}.`})

  await sendGmail({
    appName,
    toEmail: email,
    toSubject: 'Reset Password',
    toBody: `
      <p>Hi ${firstName},</p>
      <p>Click the link below to reset your password.</p>
      <a href="${path}" style="color: black; text-decoration: none;">
        ${path}
      </a>
      `
  })
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
  res.send({ message: 'Thank you for contacting us, we will respond to you shortly!'})
  await sendGmail({
    appName,
    toEmail: email,
    toSubject: `Thank you for contacting ${appName}!`,
    toBody: `
      <p>Hi ${firstName}</p>
      <p>Thank you for contacting ${appName}.  We have received your request and will respond shortly!</p>`,
    adminSubject: `New Contact Request`,
    adminBody: `
      <p>${firstName} just contacted you through ${appName}.</p>
      <div>Phone: ${phone ? phone : 'not provided'}</div>
      <div>Email: ${email}</div>
      <div>Message: ${message}</div>
    `
  })
}
