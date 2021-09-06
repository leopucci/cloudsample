const PocketCLoudHttpStatus = require('./PocketCLoudHttpStatus');

class ApiNotFoundError extends Error {
  constructor(message, statusCode = PocketCLoudHttpStatus.API_NOT_FOUND, isOperational = true, stack = '') {
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

module.exports = ApiNotFoundError;
