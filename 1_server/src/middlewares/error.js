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
  // enviaNotificacaoApi(`Caiu no errorConverter \n${errString}`, canais.PocketHttpErros);
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

  let { statusCode, message } = err;
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
  res.status(statusCode).send(response);

  const ErrorName = err.constructor.name;
  switch (ErrorName) {
    case 'ApiError':
      enviaNotificacaoApi(`ERRO 500\n${err.message}\n${err.stack}`, canais.PocketHttp500InternalServerError);
      logger.info(`ERROR 500: ${err.message}\n${err.stack}`);
      break;
    /*
    case 'ApiNotFoundError':
      enviaNotificacaoApi(`ERRO 404\n${err.message}`, canais.PocketHttp404NotFound);
      logger.info(`ERROR 404: ${err.message}`);
      break;
    case 'ClientError':
      enviaNotificacaoApi(`ERRO 400\n${err.message}`, canais.PocketHttp400BadRequest);
      logger.info(`ERROR 400: ${err.message}`);
      // expected output: "Mangoes and papayas are $2.79 a pound."
      break;
    case 'ClientUnauthorizedError':
      enviaNotificacaoApi(`ERRO 401\n${err.message}`, canais.PocketHttp401Unauthorized);
      logger.info(`ERROR 401: ${err.message}`);
      // expected output: "Mangoes and papayas are $2.79 a pound."
      break;
      */
    default:
      enviaNotificacaoApi(`ERROR.js DEFAULT CORRIJA\n${err.message}`, canais.PocketHttpErros);
  }
};

module.exports = {
  errorConverter,
  errorHandler,
};
