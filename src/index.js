// Config environment
require('dotenv').config()

// Mail Service
const { MailService } = require('./mails')
const mailService = new MailService()

// Consumer
const { Consumer } = require('./services/consumer')
const consumer = new Consumer(mailService)

// Start the consumer
consumer.consumeMessage()
