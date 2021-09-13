class ApiError extends Error {
  constructor(message, isOperational = true, errorId = 0) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorId = errorId;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
