const PocketCLoudHttpStatus = require('./PocketCLoudHttpStatus');

class ClientError extends Error {
  constructor(message, errorId = 0, email = null) {
    super(message);
    this.statusCode = PocketCLoudHttpStatus.CLIENT_ERROR_BAD_REQUEST;
    this.errorId = errorId;
    this.email = email;
  }
}

module.exports = ClientError;
