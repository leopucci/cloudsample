const mongoose = require('mongoose');
const safeJsonStringify = require('safe-json-stringify');
const { enviaNotificacaoSite, enviaNotificacaoApi } = require('./utils/notify');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
    /// avisa o pm2 que a aplicação esta pronta.
    process.send('ready');
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const uncaughtExceptionHandler = (error) => {
  logger.error(error);
  enviaNotificacaoApi(
    `Deu merda jovem, caiu lá no unexpectedErrorHandler voce programou bem mal... \n ${safeJsonStringify(error)}`
  );
  console.error(error, 'Uncaught Exception thrown vai dar process.exit(1)');
  exitHandler();
};

const unhandledRejectionHandler = (reason, p) => {
  logger.error(reason, 'Unhandled Rejection at Promise', p);
  enviaNotificacaoApi(`Caiu lá no unhandledRejectionHandler voce programou bem mal... \n ${safeJsonStringify(reason)}`);
};

process.on('uncaughtException', uncaughtExceptionHandler);
process.on('unhandledRejection', unhandledRejectionHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

process.on('SIGINT', function () {
  server.close(function () {
    process.exit(0);
  });
});
