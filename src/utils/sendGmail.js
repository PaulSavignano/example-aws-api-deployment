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
        primary: { main }
      },
      typography: {
        body1,
        body2,
        headline,
        letterSpacing,
        subheading,
        title,
      }
    } = theme

    const renderImage = (image) => {
      const { elevation, src, style = {} } = image
      const border = style.border ? `border: ${style.border};` : ''
      const borderRadius = style.borderRadius ? `border-radius: ${image.borderRadius};` : ''
      const boxShadow = elevation ? `
        box-shadow: ${shadows[elevation]} !important;
        -webkit-box-shadow: ${shadows[elevation]} !important;
        -moz-box-shadow: ${shadows[elevation]} !important;
      ` : ''
      const margin = style.margin ? `${image.margin};` : '0 0 .35em;'
      return `
        <img
          src="assets.savignano.io/${src}"
          alt="business"
          height="60px"
          width="auto"
          style="${border, borderRadius, boxShadow, margin}"
        />
      `
    }

    const renderTypographyStyle = ({
      lineHeight,
      fontWeight,
      fontSize,
      fontFamily,
      color,
      letterSpacing,
      margin,
    }) => {
      return `
        ${lineHeight ? `line-height: ${lineHeight};` : ''}
        ${fontWeight ? `font-weight: ${fontWeight};` : ''}
        ${fontSize ? `font-size: ${fontSize};` : ''}
        ${fontFamily ? `font-family: ${fontFamily};` : ''}
        ${color ? `color: ${color};` : ''}
        ${letterSpacing ? `letter-spacing: ${letterSpacing};` : ''}
        ${margin ? `margin: ${margin};` : ''}
      `
    }

    const renderName = ({ name, image }) => {
      const { children, style } = name
      const nameString = `
        <h2 style="${renderTypographyStyle({ ...style, color: main, margin: '0 0 0.35em;' })}">
          ${children}
        </h2>
      `
      if (image.src) {
        return `
          ${renderImage(image)}
          ${nameString}
        `
      }
      return nameString
    }




    const emailTemplate = (body) => (`
      <!doctype html>
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css?family=Dancing+Script|Open+Sans+Condensed:300" rel="stylesheet">
        <style type="text/css">
          * {
            ${renderTypographyStyle({ ...body1 })}
          }
          a {
            text-decoration: none !important;
            color: ${main} !important;
          }
          p {
            ${renderTypographyStyle({ ...body1, margin: '0 0 0.35em' })}
          }
          h1 {
            ${renderTypographyStyle({ ...headline, margin: '0 0 0.35em' })}
          }
          h2 {
            ${renderTypographyStyle({ ...title, margin: '0 0 0.35em' })}
          }
          h3 {
            ${renderTypographyStyle({ ...subheading, margin: '0 0 0.35em' })}
          }
          aside {
            ${renderTypographyStyle({ ...body2, margin: '0 0 0.35em' })}
          }
          .gutterBottom {
            margin: '0 0 0.35em'
          }
        </style>
        </head>
        <body>
           <main>
            ${body}
            <br/>
            <div>
              <a href="https://${appName}">
                ${renderName({ name, image })}
              </a>
            </div>
            <div>
              <a href="mailto:${gmailUser}">
                <span style="color: ${body1.color};">
                  ${gmailUser}
                </span>
              </a>
            </div>
            ${phone ? `
              <div>
                <a href="tel:${phone.replace(/\D+/g, '')}">
                  <span style="color: ${body1.color};">
                    ${phone}
                  </span>
                </a>
              </div>
            ` : '' }
            ${address.street ? `<div>${address.street}</div>` : '' }
            ${address.zip ? `<div>${address.city} ${address.state}, ${address.zip}</div>` : '' }
           </main>
        </body>
      </html>
    `)

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

    if (toEmail && adminSubject) {
      const userMail = {
        from: gmailUser,
        to: toEmail,
        subject: toSubject,
        html: emailTemplate(toBody)
      }
      const userEmailPromise = transporter.sendMail(userMail)

      const adminMail = {
        from: gmailUser,
        to: gmailUser,
        subject: adminSubject,
        html: emailTemplate(adminBody)
      }
      const adminEmailPromise = transporter.sendMail(adminMail)
      await Promise.all([ userEmailPromise, adminEmailPromise ])
      return
    } else if (toEmail) {
      const userMail = {
        from: gmailUser,
        to: toEmail,
        subject: toSubject,
        html: emailTemplate(toBody)
      }
      await transporter.sendMail(userMail)
    } else if (adminSubject) {
      const adminMail = {
        from: gmailUser,
        to: gmailUser,
        subject: adminSubject,
        html: emailTemplate(adminBody)
      }
      await transporter.sendMail(adminMail)
    }
    return
  } catch (error) {
    return Promise.reject(error)
  }
}

export default sendGmail
