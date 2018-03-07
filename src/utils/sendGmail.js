import nodemailer from 'nodemailer'

import ApiConfig from '../models/ApiConfig'
import Brand from '../models/Brand'
import Theme from '../models/Theme'
import getRgbTotal from '../utils/getRgbTotal'
import shadows from './shadows'

const sendGmail = async (props) => {
  try {
    const {
      brandName,
      to,
      toSubject,
      toBody,
      fromSubject,
      fromBody,
    } = props
    console.log('brandName is', brandName)
    const apiConfig = await ApiConfig.findOne({ brandName })
    if (!apiConfig) throw Error('No apiConfig found, email not sent')
    const {
      gmailUser,
      oauthAccessToken,
      oauthClientId,
      oauthClientSecret,
      oauthRefreshToken
    } = apiConfig.values
    const brand = await Brand.findOne({ brandName })
    const theme = await Theme.findOne({ brandName })
    if (!brand) throw Error('Could not find brand, email not sent')
    const {
      business: {
        address,
        image,
        name,
        phone,
      },
    } = brand
    const {
      palette: {
        text: { primary },
        primary: { main }
      },
      typography: { fontFamily }
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
        p, div, ol {
          font-family: ${fontFamily};
        }
        a {
          text-decoration: none;
          color: inherit !important;
          font-family: ${fontFamily};
        }
      </style>
      </head>
      <body>
         <main>
          ${body}
          <br/><br/>
          <a href="https://${brandName}" style="text-decoration: none; color: ${primary}; font-family: ${name.fontFamily}; font-size: ${name.fontSize}; font-weight: ${name.fontWeight}; letter-spacing: ${name.letterSpacing};  text-shadow: ${name.textShadow};">
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
            <a href="mailto:${gmailUser}" style="text-decoration: none; color: ${main};">
              ${gmailUser}
            </a>
          </div>
          ${phone ? `
            <div style="font-family: ${fontFamily}">
              <a href="tel:${phone.replace(/\D+/g, '')}" style="text-decoration: none; color: inherit;">
                ${phone}
              </div>
          ` : '' }
          ${address.street ? `<div style="font-family: ${fontFamily}">${address.street}</div>` : '' }
          ${address.zip ? `<div style="font-family: ${fontFamily}">${address.city} ${address.state}, ${address.zip}</div>` : '' }
         </main>
      </body>
      </html>
    `)

    const userMail = {
      from: gmailUser,
      to: to,
      subject: toSubject,
      html: emailTemplate(toBody)
    }
    if (fromSubject) {
      const adminMail = {
        from: gmailUser,
        to: gmailUser,
        subject: fromSubject,
        html: emailTemplate(fromBody)
      }
      const adminMailInfo = await transporter.sendMail(adminMail)
      console.info('sendGmail adminMailInfo: ', adminMailInfo)
    }
    const userMailInfo = await transporter.sendMail(userMail)
    if (!userMailInfo) throw 'User email did not send'
    console.info('sendGmail userMailInfo: ', userMailInfo)
    return Promise.resolve(userMailInfo)
  } catch (error) {
    return Promise.reject(error)
  }
}

export default sendGmail
