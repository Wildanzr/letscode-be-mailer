const amqp = require('amqplib')
const { ClientError } = require('../errors')

class Consumer {
  constructor () {
    this.name = 'consumer'
    this._connection = null
    this._channel = null
  }

  async consumeMessage () {
    console.log('Consumer listening for messages...')
    try {
      // Create a connection to the RabbitMQ server
      const host = process.env.RABBITMQ_HOST || 'localhost'
      const port = process.env.RABBITMQ_PORT || 5672
      const user = process.env.RABBITMQ_USERNAME || 'guest'
      const password = process.env.RABBITMQ_PASSWORD || 'guest'

      this._connection = await amqp.connect(`amqp://${user}:${password}@${host}:${port}`)
      this._channel = await this._connection.createChannel()

      // Register a consumer for the queue, or create the queue if it doesn't exist
      await this._channel.assertQueue('mail', { durable: true })

      // Consume message from the mail queue
      this._channel.consume('mail', async (data) => {
        console.log('receive new message')
        const payload = JSON.parse(data.content.toString())

        await this.output(payload)

        this._channel.ack(data)
        console.log('message ack')
      })
    } catch (error) {
      console.log(error)
      const message = error.message || 'Internal Server Error'
      const statusCode = error.statusCode || 500
      throw new ClientError(message, statusCode)
    }
  }

  async output (message) {
    return new Promise(resolve => setTimeout(() => {
      console.log(message)
      resolve(message)
    }, 10000))
  }
}

module.exports = {
  Consumer
}
