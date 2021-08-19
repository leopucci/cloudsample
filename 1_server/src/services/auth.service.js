const httpStatus = require('http-status');
const { OAuth2Client } = require('google-auth-library');
const tokenService = require('./token.service');
const userService = require('./user.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const { User } = require('../models');
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
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid credentials');
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

/*
const user = await db.user.upsert({ 
    where: { email: email },
    update: { name, picture },
    create: { name, email, picture }
})
*/

/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email);
  if (user != null && 'isPasswordBlank' in user && user.isPasswordBlank === true) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'You have logged in using Google or Apple Login, use them instead or click forgot password to generate a password'
    );
  }

  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
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
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
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
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
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
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
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
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

module.exports = {
  googleLoginOrCreateAccount,
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
