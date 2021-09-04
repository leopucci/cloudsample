const morgan = require('morgan');
const dns = require('dns');
const safeJsonStringify = require('safe-json-stringify');
const config = require('./config');
const logger = require('./logger');
const { enviaNotificacaoApi, canais } = require('../utils/notify');

function reverseLookup(ip) {
  dns.reverse(ip, function (err, domains) {
    if (err != null) {
      return false;
    }
    return domains;
  });
}

morgan.token('message', (req, res) => res.locals.errorMessage || '');

const getIpFormat = () => (config.env === 'production' ? ':remote-addr - ' : '');
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: {
    write: (message) => {
      logger.info(message.trim());
    },
  },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: {
    write: (message) => {
      enviaNotificacaoApi(`ERRO\n${message.trim()}`, canais.PocketErrosHttp);
      logger.info(`ERROR: ${message.trim()}`);
    },
  },
});

module.exports = {
  successHandler,
  errorHandler,
};
