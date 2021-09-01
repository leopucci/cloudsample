const mongoose = require('mongoose');
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

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  enviaNotificacaoApi(
    `Deu merda jovem, caiu lá no unexpectedErrorHandler voce programou bem mal... \n ${JSON.stringify(error)}`
  );
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

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
