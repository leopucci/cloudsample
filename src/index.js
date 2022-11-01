const mongoose = require('mongoose');
const safeJsonStringify = require('safe-json-stringify');
const { enviaNotificacaoApi, canais } = require('./utils/notify');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;

mongoose.connection.once('open', function () {
  logger.info('MongoDB event open');
  logger.debug(`MongoDB connected ${config.mongoose.url}`);

  mongoose.connection.on('connected', function () {
    logger.info('MongoDB event connected');
  });

  mongoose.connection.on('disconnected', function () {
    logger.warn('MongoDB event disconnected');
  });

  mongoose.connection.on('reconnected', function () {
    logger.info('MongoDB event reconnected');
  });

  mongoose.connection.on('error', function (err) {
    logger.error(`MongoDB event error: ${err}`);
  });

  // return resolve();
  //  return server.start();
});

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

const uncaughtExceptionHandler = (error, origin) => {
  logger.error(error);
  enviaNotificacaoApi(
    `Deu merda jovem, caiu lá no uncaughtExceptionHandler voce programou bem mal... \nOrigem: ${origin}\nStack ou mensagem: ${
      error.stack || error.message
    }`
  );
  logger.error(
    `Uncaught Exception thrown vai dar process.exit(1)\n Origem: ${origin}\n Stack ou mensagem: ${error.stack}` ||
      error.message
  );
  exitHandler();
};

// https://nodejs.org/api/process.html#process_event_unhandledrejection
const unhandledRejectionHandler = (reason, promise) => {
  logger.error(`Caiu lá no unhandledRejectionHandler \n Promise: ${promise} \n Reason: ${reason}`);
  enviaNotificacaoApi(`Caiu lá no unhandledRejectionHandler \n Promise: ${promise} \n Reason: ${reason}`);
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
    enviaNotificacaoApi(`Baixando aplicação recebeu SIGINT`, canais.PocketDeployApi);
    process.exit(0);
  });
});

const isDevelopmentProcess = (process.env.NODE_ENV || 'development') === 'development';
if (!isDevelopmentProcess) {
  enviaNotificacaoApi(`APLICAÇAO NO AR!`, canais.PocketDeployApi);
}
