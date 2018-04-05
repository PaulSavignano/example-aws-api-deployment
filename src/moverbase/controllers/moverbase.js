import fetch from 'node-fetch'

import Config from '../../models/Config'

export const requestEstimate = async (req, res) => {
  const {
    body: {
      date,
      firstName,
      lastName,
      phone,
      email,
      from,
      to,
      size,
      note
    },
    appName
  } = req
  try {
    const config = await ApiConfig.findOne({ appName })
    if (!config) throw 'Sorry, there was no config found'
    const auth = `Basic ${new Buffer(config.values.moverbaseKey + ':').toString('base64')}`
    const response = await fetch(`https://api.moverbase.com/v1/leads/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth
      },
      body: JSON.stringify(body)
    })
    const { email, firstName, phone, note } = body
    const emailInfo = await sendGmail({
      appName,
      toEmail: email,
      toSubject: 'Thank you for contacting us for a free estimate',
      toBody: `
        <p>Hi ${fistName},</p>
        <p>We have received your request for a free estimate and will contact you shortly!</p>
      `,
      adminSubject: `New Estimate Request`,
      adminBody: `
        <p>${firstName} just contacted you through ${appName}.</p>
        ${phone && `<div>Phone: ${phone}</div>`}
        <div>Email: ${email}</div>
        <div>Note: ${note}</div>
      `
    })
    res.status(200).send()
  } catch (error) {
    console.error(error)
    res.status(400).send({ error })
  }
}
