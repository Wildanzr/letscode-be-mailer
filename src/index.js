// Config environment
require('dotenv').config()

// Wait for RabbitMQ to start before starting the consumer, set timeout for 30 seconds
setTimeout(() => {
  // Mail Service
  const { MailService } = require('./mails')
  const mailService = new MailService()

  // Consumer
  const { Consumer } = require('./services/consumer')
  const consumer = new Consumer(mailService)

  // Start the consumer
  consumer.consumeMessage()
}, 30000)

console.log('Waiting for RabbitMQ to start...')
