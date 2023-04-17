/* eslint-disable prefer-promise-reject-errors */
const path = require('path')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const { google } = require('googleapis')
const { logger } = require('../utils/logger')
const OAuth2 = google.auth.OAuth2

class MailService {
  constructor () {
    this.name = 'mailService'

    this.transporter = this.transporter.bind(this)
    this.sendEmail = this.sendEmail.bind(this)
  }

  async transporter () {
    // Create OAuth2 object details
    const oauth2Client = new OAuth2(
      process.env.OAUTH_CLIENT_ID,
      process.env.OAUTH_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    )

    // Set Credentials
    oauth2Client.setCredentials({
      refresh_token: process.env.OAUTH_REFRESH_TOKEN
    })

    const accessToken = oauth2Client.getAccessToken()

    // Create Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        type: 'OAuth2',
        user: process.env.OAUTH_EMAIL,
        accessToken,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
      }
    })

    // Configure Transporter to use Handlebars
    transporter.use('compile', hbs({
      viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve(__dirname, './templates'),
        defaultLayout: false
      },
      viewPath: path.join(__dirname, './templates'),
      extName: '.handlebars'
    }))

    return transporter
  }

  async sendEmail (message, subject, template) {
    // Destructure message
    const { name, email, link } = message

    // Declare options
    const mailOptions = {
      from: process.env.OAUTH_EMAIL,
      to: email,
      subject,
      text: 'LetsCode',
      template,
      context: {
        name,
        link
      }
    }

    const emailTransporter = await this.transporter()

    // Send Email
    emailTransporter.sendMail(mailOptions, (err, res) => {
      if (err) {
        logger.error(err)
        return false
      } else {
        logger.warn(res)
      }
    })
    return true
  }
}

module.exports = {
  MailService
}
