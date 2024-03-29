const morgan = require('morgan');
// const dns = require('dns');

const config = require('./config');
const logger = require('./logger');
const { enviaNotificacaoApi, canais } = require('../utils/notify');
/*
function reverseLookup(ip) {
  try {
    dns.reverse(ip, function (err, domains) {
      if (err != null) {
        return false;
      }
      return domains;
    });
  } catch (error) {
    enviaNotificacaoApi(`ERRO RESOLVENDO DNS Nome ${error.name}\n Mensagem ${error.message}`);
  }
}
*/
morgan.token('message', (req, res) => res.locals.errorMessage || '');
morgan.token('reqId', (req) => req.id || '');

const getIpFormat = () => (config.env === 'production' ? ':remote-addr' : '');
const successResponseFormat = `IP #${getIpFormat()}# - :method :url :status - :response-time ms \n UA::user-agent ReqId: :reqId`;
const errorResponseFormat = `IP #${getIpFormat()}# - :method :url HTTPSTATUS :status - :response-time ms - message: :message \n UA::user-agent ReqId: :reqId`;

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: {
    write: (message) => {
      logger.http(message.trim());
    },
  },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: {
    write: (message) => {
      const messageTrim = message.trim();
      const myRegexpHTTPSTATUS = /HTTPSTATUS ([0-9]+)/g;
      const matchHttpStatus = myRegexpHTTPSTATUS.exec(messageTrim);
      const myRegexpIP = /IP #(.*?)#/g;
      const matchIP = myRegexpIP.exec(messageTrim);
      // let reverse;
      if (matchIP != null && matchIP.length > 1) {
        // reverse = reverseLookup(matchIP[1]);
        // messageTrim = `${messageTrim} ${reverse}`;
      }

      if (matchHttpStatus != null && matchHttpStatus.length > 1) {
        switch (matchHttpStatus[1]) {
          case '400':
            enviaNotificacaoApi(`ERRO 400\n${messageTrim}`, canais.PocketHttp400BadRequest);
            logger.info(`ERROR 400: ${messageTrim}`);
            break;
          case '401':
            enviaNotificacaoApi(`ERRO 401\n${messageTrim}`, canais.PocketHttp401Unauthorized);
            logger.info(`ERROR 401: ${messageTrim}`);
            break;
          case '404':
            enviaNotificacaoApi(`ERRO 404\n${messageTrim}`, canais.PocketHttp404NotFound);
            logger.info(`ERROR 404: ${messageTrim}`);
            break;
          case '500':
            enviaNotificacaoApi(`ERRO 500\n${messageTrim}`, canais.PocketHttp500InternalServerError);
            logger.info(`ERROR 500: ${messageTrim}`);
            break;
          default:
            enviaNotificacaoApi(`ERRO DEFAULT CORRIJA\n${messageTrim}`, canais.PocketHttpErros);
            logger.info(`ERROR DEFAULT CORRIJA: ${messageTrim}`);
        }
      } else {
        enviaNotificacaoApi(`ERRO FALHOU REGEXP CORRIJA \n${messageTrim}`, canais.PocketHttpErros);
        logger.info(`ERRO FALHOU REGEXP CORRIJA  ${messageTrim}`);
      }
    },
  },
});

module.exports = {
  successHandler,
  errorHandler,
};
