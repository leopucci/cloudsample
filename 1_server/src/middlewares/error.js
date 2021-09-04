const mongoose = require('mongoose');
const httpStatus = require('http-status');
const safeJsonStringify = require('safe-json-stringify');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/errors/ApiError');
const ApiNotFoundError = require('../utils/errors/ApiNotFoundError');
const ClientError = require('../utils/errors/ClientError');
const ClientUnauthorizedError = require('../utils/errors/ClientUnauthorizedError');
const { enviaNotificacaoApi, canais } = require('../utils/notify');

const errorConverter = (err, req, res, next) => {
  const errString = safeJsonStringify(err);
  // enviaNotificacaoApi(`Caiu no errorConverter \n${errString}`, canais.PocketErrosHttp);
  let error = err;
  if (
    !(
      error instanceof ApiError ||
      error instanceof ApiNotFoundError ||
      error instanceof ClientError ||
      error instanceof ClientUnauthorizedError
    )
  ) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(message, statusCode, false, err.stack);
  }

  next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // const errString = safeJsonStringify(err);
  // enviaNotificacaoApi(`Caiu no errorHandler \n${errString}`, canais.PocketErrosHttp);
  let { statusCode, message } = err;
  logger.error(`Caiu no error handler Tipo de erro: ${err.constructor.name}`);
  logger.error(`Caiu no error handler err.isOperational: ${err.isOperational}`);
  if (config.env === 'production' && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  };

  if (config.env === 'development') {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
