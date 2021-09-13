const PocketCLoudHttpStatus = require('./PocketCLoudHttpStatus');

class ApiNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = PocketCLoudHttpStatus.API_NOT_FOUND;
  }
}

module.exports = ApiNotFoundError;
