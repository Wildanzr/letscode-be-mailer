/* eslint-disable prefer-promise-reject-errors */
const path = require('path')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

class MailService {
  constructor () {
    this.name = 'mailService'

    this.transporter = this.transporter.bind(this)
    this.sendEmail = this.sendEmail.bind(this)

    // console.log(process.env.OAUTH_CLIENT_ID,
    //   process.env.OAUTH_CLIENT_SECRET,
    //   process.env.OAUTH_REFRESH_TOKEN,
    //   process.env.OAUTH_EMAIL,
    //   process.env.OAUTH_CLIENT_ID,
    //   process.env.OAUTH_CLIENT_SECRET,
    //   process.env.OAUTH_REFRESH_TOKEN
    // )
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

    // Request Access Token
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject('Failed to create access token')
        }
        resolve(token)
      })
    })

    // Create Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
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
      from: process.env.USER_EMAIL,
      to: email,
      subject,
      template,
      context: {
        name,
        link
      },
      attachments: [{
        filename: 'wave.png',
        path: path.join(__dirname, './images/wave.png'),
        cid: 'wave'
      }]
    }

    const emailTransporter = await this.transporter()

    // Send Email
    emailTransporter.sendMail(mailOptions, (err, res) => {
      if (err) {
        console.log(err)
        return false
      } else {
        console.log('Email Sent')
      }
    })
    return true
  }
}

module.exports = {
  MailService
}
