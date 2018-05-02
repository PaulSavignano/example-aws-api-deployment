import nodemailer from 'nodemailer'

import Config from '../models/Config'
import App from '../models/App'
import Theme from '../models/Theme'
import shadows from './shadows'

const sendGmail = async (props) => {
  const {
    appName,
    toEmail,
    toSubject,
    toBody,
    adminSubject,
    adminBody,
  } = props
  try {
    const appPromise = App.findOne({ appName })
    const configPromise = Config.findOne({ appName })
    const themePromise = Theme.findOne({ appName })

    const [ app, config, theme ] = await Promise.all([ appPromise, configPromise, themePromise ])

    if (!app) throw Error('Send email error, no app found')
    if (!config) throw Error('Send email error, no config found')
    if (!theme) throw Error('Send email error, no theme found')
    const {
      gmailUser,
      oauthAccessToken,
      oauthClientId,
      oauthClientSecret,
      oauthRefreshToken
    } = config.values

    if (!gmailUser || !oauthAccessToken || !oauthClientId || !oauthClientSecret || !oauthRefreshToken) {
      throw Error('Send email error, no admin mail values')
    }

    const {
      business: {
        address,
        image,
        name,
        phone,
      },
    } = app
    const {
      palette: {
        text: { primary },
        primary: { main }
      },
      typography: { fontFamily, letterSpacing }
    } = theme
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        type: 'OAuth2',
        user: gmailUser,
        clientId: oauthClientId,
        clientSecret: oauthClientSecret,
        refreshToken: oauthRefreshToken,
        accessToken: oauthAccessToken
      }
    })
    const emailTemplate = (body) => (`
      <!doctype html>
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css?family=Dancing+Script|Open+Sans+Condensed:300" rel="stylesheet">
        <style type="text/css">
          * {
            font-family: ${fontFamily};
            color: ${primary};
            letter-spacing: ${letterSpacing};
          }
          a {
            text-decoration: none;
            color: ${main};
          }
        </style>
        </head>
        <body>
           <main>
            ${body}
            <br/><br/><br/>
            <a href="https://${appName}" style="font-size: ${name.fontSize}; font-weight: ${name.fontWeight}; letter-spacing: ${name.letterSpacing};  text-shadow: ${name.textShadow};">
              ${image && image.src ? `
                <img
                  src="assets.savignano.io/${image.src}"
                  alt="business"
                  height="60px"
                  width="auto"
                  style="border: ${image.border}; border-radius: ${image.borderRadius}; box-shadow: ${shadows[image.elevation]} !important; -webkit-box-shadow: ${shadows[image.elevation]} !important; -moz-box-shadow: ${shadows[image.elevation]} !important; margin: ${image.margin}"
                />` : ''}
              <div>
                ${name.text}
              </div>
            </a>
            <div>
              <a href="mailto:${gmailUser}">${gmailUser}</a>
            </div>
            ${phone ? `
              <div>
                <a href="tel:${phone.replace(/\D+/g, '')}" style="color: inherit;">${phone}</a>
              </div>
            ` : '' }
            ${address.street ? `<div>${address.street}</div>` : '' }
            ${address.zip ? `<div>${address.city} ${address.state}, ${address.zip}</div>` : '' }
           </main>
        </body>
      </html>
    `)

    if (toEmail) {
      const userMail = {
        from: gmailUser,
        to: toEmail,
        subject: toSubject,
        html: emailTemplate(toBody)
      }
      const userEmail = await transporter.sendMail(userMail)
      console.info('send email success! ', userEmail)
    }

    if (adminSubject) {
      const adminMail = {
        from: gmailUser,
        to: gmailUser,
        subject: adminSubject,
        html: emailTemplate(adminBody)
      }
      const adminEmail = await transporter.sendMail(adminMail)
      console.info('send admin email success! ', adminEmail)
    }
    return
  } catch (error) {
    return Promise.reject(error)
  }
}

export default sendGmail
