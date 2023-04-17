const pretty = require('pino-pretty')
const pino = require('pino')
const stream = pretty({
  colorize: true,
  colorizeObjects: true,
  translateTime: 'SYS:standard',
  ignore: 'pid,hostname'
})
const logger = pino(stream)

module.exports = {
  logger
}
