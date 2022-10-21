// Config environment
require('dotenv').config()

// Consumer Service
const { Consumer } = require('./services/consumer')

// Create a new instance of the Consumer class
const consumer = new Consumer()

// Start the consumer
consumer.consumeMessage()
