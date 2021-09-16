const PocketCLoudHttpStatus = require('./PocketCLoudHttpStatus');

class ClientError extends Error {
  constructor(message, erroCode = 0, email = null) {
    super(message);
    this.statusCode = PocketCLoudHttpStatus.CLIENT_ERROR_BAD_REQUEST;
    this.erroCode = erroCode;
    this.email = email;
  }
}

module.exports = ClientError;
