// blog.restcase.com/rest-api-error-codes-101/
/*
200 - OK
400 - Bad Request (Client Error) - A json with error \ more details should return to the client.
401 - Unauthorized
500 - Internal Server Error - A json with an error should return to the client only when there is no security risk by doing that.
*/
const PocketCloudHttpStatus = {
  CLIENT_ERROR_BAD_REQUEST: 400,
  CLIENT_ERROR_UNAUTHORIZED: 401,
  API_NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
module.exports = PocketCloudHttpStatus;
