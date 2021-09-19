const Joi = require('joi');
const { password } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    confirmPassword: Joi.any()
      .equal(Joi.ref('password'))
      .required()
      .label('Confirm password')
      .messages({ 'any.only': '{{#label}} does not match' }),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    recaptcha: Joi.string().required(),
  }),
};

const loginErrors = {
  body: Joi.object().keys({
    message: Joi.string().required(),
    channel: Joi.number().integer(),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
    recaptcha: Joi.string().required(),
  }),
};

const appleLogin = {
  body: Joi.object().keys({
    authorization: Joi.string().required(),
    appleUser: Joi.string().required(),
    recaptcha: Joi.string().required(),
  }),
};

const googleLogin = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    recaptcha: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
    recaptcha: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    recaptcha: Joi.string().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
    recaptcha: Joi.string().required(),
  }),
};

const appleSignInWebHook = {
  body: Joi.object().keys({
    payload: Joi.string().required(),
  }),
};

const githubWebhook = {
  body: Joi.object().keys({
    ref: Joi.string().required(),
    before: Joi.string(),
    after: Joi.string(),
    repository: Joi.object(),
    pusher: Joi.object(),
    sender: Joi.object(),
    created: Joi.boolean(),
    deleted: Joi.boolean(),
    forced: Joi.boolean(),
    base_ref: Joi.string().allow(null),
    compare: Joi.string(),
    commits: Joi.array(),
    head_commit: Joi.object(),
  }),
};

module.exports = {
  register,
  loginErrors,
  login,
  appleLogin,
  googleLogin,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  verifyEmail,
  appleSignInWebHook,
  githubWebhook,
};
