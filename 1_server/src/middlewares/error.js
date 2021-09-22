const mongoose = require('mongoose');
const httpStatus = require('http-status');
// const safeJsonStringify = require('safe-json-stringify');
const config = require('../config/config');
const logger = require('../config/logger');
const ApiError = require('../utils/errors/ApiError');
const ApiNotFoundError = require('../utils/errors/ApiNotFoundError');
const ClientError = require('../utils/errors/ClientError');
const ClientUnauthorizedError = require('../utils/errors/ClientUnauthorizedError');
const { enviaNotificacaoApi, canais } = require('../utils/notify');

const errorConverter = (err, req, res, next) => {
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
  const { erroCode } = err;
  let response;
  if (err instanceof ApiError) {
    enviaNotificacaoApi(
      `ERRO 500\nURL: ${req.originalUrl}\n${err.message}\n${err.stack}`,
      canais.PocketHttp500InternalServerError
    );
    logger.info(`ERROR 500: ${err.message}\n${err.stack}`);

    if (config.env === 'production' && !err.isOperational) {
      statusCode = httpStatus.INTERNAL_SERVER_ERROR;
      message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    }
    res.locals.errorMessage = err.message;
    response = {
      code: statusCode,
      message,
    };
    res.status(statusCode).send(response);
    return;
  }

  if (err instanceof ClientError) {
    //  enviaNotificacaoApi(`ERRO 400\n${err.message}`, canais.PocketHttp400BadRequest);
    // logger.info(`ERROR 400: ${err.message}`);
    const { email } = err;
    res.locals.errorMessage = err.message;
    response = {
      code: statusCode,
      message,
      ...(erroCode && { erroCode }),
      ...(email || null),
    };
    res.status(statusCode).send(response);
    return;
  }

  if (err instanceof ApiNotFoundError) {
    //      enviaNotificacaoApi(`ERRO 404\n${err.message}`, canais.PocketHttp404NotFound);
    //    logger.info(`ERROR 404: ${err.message}`);
    res.locals.errorMessage = err.message;
    response = {
      code: statusCode,
      message,
      ...(erroCode && { erroCode }),
    };
    res.status(statusCode).send(response);
    return;
  }

  if (err instanceof ClientUnauthorizedError) {
    // enviaNotificacaoApi(`ERRO 401\n${err.message}`, canais.PocketHttp401Unauthorized);
    // logger.info(`ERROR 401: ${err.message}`);
    res.locals.errorMessage = err.message;
    response = {
      code: statusCode,
      message,
      ...(erroCode && { erroCode }),
      //         ...(config.env === 'development' && { stack: err.stack }),
    };
    res.status(statusCode).send(response);
    return;
  }

  // FALHA GROSSEIRA (de dev) CAI AQUI POR SEGURANÇA
  // ESTE CODIGO PROTEGE QUE O CLIENTE NAO RECEBA NADA E A INTERFACE/UI TRAVE SEM RESPOSTA
  // NAO REMOVA (LP)
  statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  message = 'Error unkown - 19898-3';
  response = {
    code: statusCode,
    message,
  };
  res.status(statusCode).send(response);
  enviaNotificacaoApi(`ERROR.js CAIU NO ERRO DEFAULT - CORRIJA\n${err.message}`, canais.PocketHttpErros);
};

module.exports = {
  errorConverter,
  errorHandler,
};
