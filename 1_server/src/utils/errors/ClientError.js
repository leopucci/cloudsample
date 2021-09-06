const PocketCLoudHttpStatus = require('./PocketCLoudHttpStatus');

class ClientError extends Error {
  constructor(message, statusCode = PocketCLoudHttpStatus.CLIENT_ERROR_BAD_REQUEST, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ClientError;
