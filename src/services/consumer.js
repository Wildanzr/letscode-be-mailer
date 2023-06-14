const amqp = require('amqplib')
const { ClientError } = require('../errors')
const { logger } = require('../utils/logger')

class Consumer {
  constructor (mailService) {
    this.name = 'consumer'
    this._mailService = mailService
    this._connection = null
    this._channel = null

    this.consumeMessage = this.consumeMessage.bind(this)
  }

  async consumeMessage () {
    logger.info('Consumer listening for messages...')
    try {
      // Create a connection to the RabbitMQ server
      const HOST = process.env.RABBITMQ_HOST || 'localhost'
      const PORT = process.env.RABBITMQ_PORT || 5672
      const USER = process.env.RABBITMQ_USERNAME || 'guest'
      const PASSWORD = process.env.RABBITMQ_PASSWORD || 'guest'

      this._connection = await amqp.connect(`amqp://${USER}:${PASSWORD}@${HOST}:${PORT}`)
      this._channel = await this._connection.createChannel()

      // Register a consumer for the queue, or create the queue if it doesn't exist
      await this._channel.assertQueue('mail', { durable: true })

      // Consume message from the mail queue
      this._channel.consume('mail', async (data) => {
        logger.info('receive new message')

        // Parse the message then destructuring the data
        const payload = await JSON.parse(data.content.toString())
        const { message, subject, template } = payload

        // Send email to the user
        await this._mailService.sendEmail(message, subject, template)

        this._channel.ack(data)
      })
    } catch (error) {
      logger.error(error)
      const message = error.message || 'Internal Server Error'
      const statusCode = error.statusCode || 500
      throw new ClientError(message, statusCode)
    }
  }

  async output (message) {
    return new Promise(resolve => setTimeout(() => {
      logger.info(message)
      resolve(message)
    }, 10000))
  }
}

module.exports = {
  Consumer
}
