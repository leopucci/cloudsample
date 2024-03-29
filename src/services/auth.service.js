const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const safeJsonStringify = require('safe-json-stringify');
// const { use } = require('passport');
const myAxiosInstance = require('../utils/axioshttp');
const config = require('../config/config');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ClientError = require('../utils/errors/ClientError');
const ReturnCodes = require('../utils/errors/ReturnCodes');
const ClientUnauthorizedError = require('../utils/errors/ClientUnauthorizedError');
const { enviaNotificacaoApi } = require('../utils/notify');
const { tokenTypes } = require('../config/tokens');
const { User } = require('../models');
const logger = require('../config/logger');
/**
 * Login with apple signIn user
 * @param {string} recaptcha
 * @returns {Promise<User>}
 */
// siteKey: process.env.RECAPTCHA_SITE_KEY,
// secretKey: process.env.RECAPTCHA_SECRET_KEY,
const verifyRecaptcha = async (token, clientIpAddress) => {
  let result;
  try {
    result = await myAxiosInstance({
      method: 'post',
      url: 'https://www.google.com/recaptcha/api/siteverify',
      params: {
        secret: config.recaptcha.secretKey,
        response: token,
        remoteIp: clientIpAddress,
      },
    });
  } catch (err) {
    enviaNotificacaoApi(`Erro no recaptcha axiostry/catch http falhou:  ${safeJsonStringify(err)}`);
    throw new ClientError('Error #10-1200');
  }
  const data = result.data || {};
  if (!data.success) {
    if (data['error-codes'].length > 1) {
      enviaNotificacaoApi(`Erro no recaptcha maior que 1:  ${safeJsonStringify(data['error-codes'])}`);
      // eh pra me avisar que isso eu previso aprender.
    }
    switch (data['error-codes'].pop()) {
      case 'timeout-or-duplicate':
        enviaNotificacaoApi(`Erro no recaptcha timeout-or-duplicate dei return true`);
        return true;
        // eslint-disable-next-line no-unreachable
        break;
      default:
        logger.debug(data);
        // eslint-disable-next-line no-case-declarations
        const codes = safeJsonStringify(data['error-codes']);
        if (data['error-codes'].length === 0) {
          enviaNotificacaoApi(`Erro no recaptcha sem error-codes - remoteIp: ${clientIpAddress}`);
        } else {
          enviaNotificacaoApi(`Erro no recaptcha default:${codes} remoteIp: ${clientIpAddress}`);
        }
    }
    throw new ClientError('Error #10-1201');
  }
  // Deixar em 0.3 por um tempo e só aumentar pra 0.5 quando madurar.
  // o certo é retornar um erro especifico e abrir um recaptcha pra ser preenchido.
  // https://stackoverflow.com/a/35641680/3156756
  // https://andremonteiro.pt/react-redux-modal/
  if (data.score < 0.3) {
    enviaNotificacaoApi(`Erro no recaptcha SCORE BAIXO:  ${safeJsonStringify(data)} remoteIp: ${clientIpAddress}`);
    throw new ClientError('Error #10-1202');
  }
  return true;
};

/*
{
  "authorization": {
    "state": "[STATE]", // The state string we used in the initApple function
    "code": "[CODE]", // A single-use authentication code that is valid for five minutes. We won't be using this for now.
    "id_token": "[ID_TOKEN]" // This is what we're really interested in. This is JSON web token we'll be decoding in the backend.
  },
  "user": {
    // User details object, we'll be storing this data in the backend as well.
    "email": "[EMAIL]",
    "name": {
      "firstName": "[FIRST_NAME]",
      "lastName": "[LAST_NAME]"
    }
  }
}
*/

// ISTO AQUI AJUDA https://dev.to/heyitsarpit/how-to-add-signin-with-apple-on-your-website-43m9

/**
 * Login with apple signIn user
 * @param {string} token
 * @returns {Promise<User>}
 */
const appleLoginOrCreateAccount = async (authorization, appleUser) => {
  let appleVerifiedData;
  try {
    appleVerifiedData = await appleSignin.verifyIdToken(
      authorization.id_token, // We need to pass the token that we wish to decode.
      {
        audience: 'com.example.web', // client id - The same one we used on the frontend, this is the secret key used for encoding and decoding the token.
        nonce: 'nonce', // nonce - The same one we used on the frontend - OPTIONAL
      }
    );
  } catch (error) {
    throw new ClientUnauthorizedError('Invalid credentials');
  }
  let user = await userService.getUserByEmail(appleUser.email);
  if (!user) {
    const newUser = new User();
    // eslint-disable-next-line camelcase
    newUser.firstName = appleUser.name.firstName;
    // eslint-disable-next-line camelcase
    newUser.lastName = appleUser.name.lastName;
    newUser.email = appleUser.email;
    newUser.apple.id = appleVerifiedData.sub;
    newUser.apple.isEmailProxy = appleVerifiedData.is_private_email;
    // newUser.profilePicture
    // eslint-disable-next-line camelcase
    newUser.isEmailVerified = appleVerifiedData.email_verified;
    newUser.isPasswordBlank = true;
    user = await userService.createUser(newUser);
    return user;
  }
  user = await userService.updateUserById(user.id, {
    firstName: appleUser.name.firstName,
    lastName: appleUser.name.lastName,
    // profilePicture: payload.picture,
    apple: {
      id: appleVerifiedData.sub,
      isEmailProxy: appleVerifiedData.is_private_email,
    },
    // Se for true, nao mexe, mas se nao for dae tenta mexer
    // eslint-disable-next-line camelcase
    isEmailVerified: user.isEmailVerified === true ? true : appleVerifiedData.email_verified,
  });
  return user;
};

/*
info: OPTIONS /v1/auth/login/google 204 - 7.852 ms
LoginTicket {
  envelope: {
    alg: 'RS256',
    kid: '6ef4bd908591f697a8a9b893b03e6a77eb04e51f',
    typ: 'JWT'
  },
  payload: {
    iss: 'accounts.google.com',
    azp: '302957349711-djkd65scmbttrl3703eudbnnsp827jeh.apps.googleusercontent.com',
    aud: '302957349711-djkd65scmbttrl3703eudbnnsp827jeh.apps.googleusercontent.com',
    sub: '108521289257407984390',
    email: 'leopucci@gmail.com',
    email_verified: true,
    at_hash: 'oKbKm-hiaVI6oXILuKSoIg',
    name: 'Leonardo Pucci',
    picture: 'https://lh3.googleusercontent.com/a-/AOh14Gj1q7gvHZvS8D7MZy4d4ht5o37nczx1Uq3LdzQ3mRk=s96-c',
    given_name: 'Leonardo',
    family_name: 'Pucci',
    locale: 'en',
    iat: 1629296344,
    exp: 1629299944,
    jti: '816356df711adf2aafc66afcc548c9ca2a6cdb07'
  }
} */

/**
 * Login with google signIn user
 * @param {string} token
 * @returns {Promise<User>}
 */
const googleLoginOrCreateAccount = async (token) => {
  const client = new OAuth2Client(process.env.CLIENT_ID);
  let payload;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_LOGIN_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw new ClientUnauthorizedError('Invalid credentials');
  }
  let user = await userService.getUserByEmail(payload.email);
  if (!user) {
    const newUser = new User();
    // eslint-disable-next-line camelcase
    newUser.firstName = payload.given_name;
    // eslint-disable-next-line camelcase
    newUser.lastName = payload.family_name;
    newUser.email = payload.email;
    newUser.google.id = payload.sub;
    newUser.google.token = token;
    newUser.profilePicture = payload.picture;
    // eslint-disable-next-line camelcase
    newUser.isEmailVerified = payload.email_verified;
    newUser.isPasswordBlank = true;
    user = await userService.createUser(newUser);
    return user;
  }
  user = await userService.updateUserById(user.id, {
    firstName: payload.given_name,
    lastName: payload.family_name,
    profilePicture: payload.picture,
    google: {
      id: payload.sub,
      token,
    },
    // Se for true, nao mexe, mas se nao for dae tenta mexer
    // eslint-disable-next-line camelcase
    isEmailVerified: user.isEmailVerified === true ? true : payload.email_verified,
  });
  return user;
};

/**
 * Login with username and password
 * @param {string} email
 * @returns {Boolean}
 */
const userHasPassword = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (user != null && 'isPasswordBlank' in user && user.isPasswordBlank === true) {
    return false;
  }
  return true;
};

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (user != null && 'isPasswordBlank' in user && user.isPasswordBlank === true) {
    throw new ClientUnauthorizedError(
      'You have logged in using Google or Apple Login, use them instead or click forgot password to generate a password'
    );
  }

  if (user != null && 'isEmailVerified' in user && user.isEmailVerified === false) {
    throw new ClientUnauthorizedError(
      'You need to confirm your e-mail address, please check your e-mail',
      ReturnCodes.ErrorCodes.LOGIN_ERROR_EMAIL_NOT_VERIFIED
    );
  }

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ClientUnauthorizedError('Incorrect email or password');
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false });
  if (!refreshTokenDoc) {
    throw new ClientError('Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ClientUnauthorizedError('Please authenticate');
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD);
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new ClientError('User not found');
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    logger.debug(error.message);
    // Expirou, nao chega nem a ver no banco
    if (error.name === 'TokenExpiredError') {
      throw new ClientError(
        'Token Expired - Request a new email to reset password',
        ReturnCodes.ErrorCodes.RESET_PASSORD_TOKEN_EXPIRED
      );
    } else if (error.name === 'JsonWebTokenError') {
      // jwt malformed
      throw new ClientError(
        'Token Error - Request a new email to reset password',
        ReturnCodes.ErrorCodes.RESET_PASSORD_TOKEN_MALFORMED
      );
    } else if (error.message === 'Token not found') {
      throw new ClientError('Token Not Found', ReturnCodes.ErrorCodes.RESET_PASSORD_TOKEN_NOT_FOUND);
    } else {
      enviaNotificacaoApi(
        `Erro no resetPassword nao catalogado:  ${safeJsonStringify(error.name)} \n  ${safeJsonStringify(error.message)}`
      );
      logger.error(error.message);
      logger.error(`Tipo de erro: ${error.name}`);
      throw new ClientError('Token Error - Request a new email');
    }
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(verifyEmailToken, tokenTypes.VERIFY_EMAIL);
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new ClientError('User not found');
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    logger.debug(error.message);
    // Expirou, nao chega nem a ver no banco
    if (error.name === 'TokenExpiredError') {
      throw new ClientError(
        'Email verification failed - Token Expired - Try to Login',
        ReturnCodes.ErrorCodes.VERIFY_EMAIL_TOKEN_EXPIRED
      );
    } else if (error.name === 'JsonWebTokenError') {
      // jwt malformed
      throw new ClientError(
        'Email verification failed - Wrong Token - Try to Login',
        ReturnCodes.ErrorCodes.VERIFY_EMAIL_TOKEN_MALFORMED
      );
    } else if (error.message === 'Token not found') {
      throw new ClientError(
        'Email verification failed - Token Not Found - Try to Login',
        ReturnCodes.ErrorCodes.VERIFY_EMAIL_TOKEN_NOT_FOUND
      );
    } else {
      enviaNotificacaoApi(
        `Erro no verifyEmail nao catalogado:  ${safeJsonStringify(error.name)} \n  ${safeJsonStringify(error.message)}`
      );
      logger.error(error.message);
      logger.error(`Tipo de erro: ${error.constructor.toString()}`);
      throw new ClientError('Email verification failed');
    }
  }
};

/**
 * Receives the apple sign in webhook
 * @param {string} payload
 * @returns {Promise}
 */
const appleSignInWebHookHandler = async (payload) => {
  try {
    const { events } = await appleSignin.verifyWebhookToken(payload, {
      // Optional Options for further verification - Full list can be found here https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
      audience: 'com.company.app', // client id - can also be an array
    });
    const {
      sub: userAppleId,
      type,
      email, // Only provided for email events
    } = events;

    logger.debug(userAppleId);
    logger.debug(email);
    switch (type) {
      case 'email-disabled':
        // Email will no longer be forwarded to the user via the private relay service
        break;
      case 'email-enabled':
        // Email will be forwarded to the user again
        break;
      case 'consent-revoked':
        // The user has decided to stop using Apple ID with this application - log them out
        break;
      case 'account-delete':
        // The user has deleted their Apple ID
        break;
      default:
        break;
    }
  } catch (err) {
    // Event token is not verified
    logger.error(err);
    throw new ClientUnauthorizedError('Invalid credentials');
  }
};

module.exports = {
  verifyRecaptcha,
  appleLoginOrCreateAccount,
  googleLoginOrCreateAccount,
  userHasPassword,
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
  appleSignInWebHookHandler,
};
