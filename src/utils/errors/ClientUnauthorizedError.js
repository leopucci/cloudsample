const PocketCLoudHttpStatus = require('./PocketCLoudHttpStatus');

class ClientUnauthorizedError extends Error {
  constructor(message, erroCode = 0) {
    super(message);
    this.statusCode = PocketCLoudHttpStatus.CLIENT_ERROR_UNAUTHORIZED;
    this.erroCode = erroCode;
  }
}

module.exports = ClientUnauthorizedError;
