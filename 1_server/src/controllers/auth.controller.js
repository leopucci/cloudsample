const passport = require('passport');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { enviaNotificacaoSite, enviaNotificacaoApi } = require('../utils/notify');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
  await emailService.sendWelcomeConfirmationEmail(user.email, verifyEmailToken, user.firstName, user.locale);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password, recaptcha } = req.body;

  const recaptchaOK = await authService.verifyRecaptcha(recaptcha, req.ip);
  if (!recaptchaOK) {
    res.status(httpStatus.NOT_ACCEPTABLE).send('{"message": "Recaptcha Error"}');
    res.end();
    return;
  }
  const userHasPassword = await authService.userHasPassword(email);
  if (!userHasPassword) {
    enviaNotificacaoApi(`${email}  userHasPassword = false `);
    res
      .status(httpStatus.NOT_ACCEPTABLE)
      .send(
        '{"message": "You have logged in using Google or Apple Login, use them instead or click forgot password to generate a password"}'
      );
    return;
  }
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const appleLoginOrCreateAccount = catchAsync(async (req, res) => {
  const { authorization, appleUser, recaptcha } = req.body;
  const recaptchaOK = await authService.verifyRecaptcha(recaptcha, req.ip);
  if (!recaptchaOK) {
    res.status(httpStatus.NOT_ACCEPTABLE).send('{"message": "Recaptcha Error"}');
    res.end();
    return;
  }
  const user = await authService.appleLoginOrCreateAccount(authorization, appleUser);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

// estou anotanto aqui mas nao sei se anotei em outro lugar
// alem do webhook, todo dia rodar um job testando a validade do token, se tiver invalido
// eu tenho que deslogar o cliente que fez login com a apple/google..
// pra isto eu tenho que gerar tokens com identificação.. pra eu saber se o cara logou com senha ou com fb/google
// dae eu vou deslogar só o token daquele cara especifico, com aquele tipo de login especifico.
const appleSignInWebHook = async (req, res) => {
  const { payload } = req.body;
  await authService.appleSignInWebHook(payload);
  res.status(httpStatus.OK).send();
};

const googleLoginOrCreateAccount = catchAsync(async (req, res) => {
  const { token, recaptcha } = req.body;
  const recaptchaOK = await authService.verifyRecaptcha(recaptcha, req.ip);
  if (!recaptchaOK) {
    res.status(httpStatus.NOT_ACCEPTABLE).send('{"message": "Recaptcha Error"}');
    res.end();
    return;
  }
  const user = await authService.googleLoginOrCreateAccount(token);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const loginErrors = catchAsync(async (req, res) => {
  const { message, channel } = req.body;
  enviaNotificacaoSite(message, channel);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const { refreshToken, recaptcha } = req.body;
  const recaptchaOK = await authService.verifyRecaptcha(recaptcha, req.ip);
  if (!recaptchaOK) {
    res.status(httpStatus.NOT_ACCEPTABLE).send('{"message": "Recaptcha Error"}');
    res.end();
    return;
  }
  const tokens = await authService.refreshAuth(refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const { email, recaptcha } = req.body;
  const recaptchaOK = await authService.verifyRecaptcha(recaptcha, req.ip);
  if (!recaptchaOK) {
    res.status(httpStatus.NOT_ACCEPTABLE).send('{"message": "Recaptcha Error"}');
    res.end();
    return;
  }
  const resetPasswordToken = await tokenService.generateResetPasswordToken(email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const authenticateGoogle = async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('google', { session: false, scope: ['profile', 'email'] })(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

const authenticateGoogleCallback = async (req, res, next) => {
  console.log('Indo fazer autenticacao');
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    if (!user) {
      return res.json({
        status: 'error',
        error: 'UNAUTHORIZED_USER',
      });
    }
    const tokens = await tokenService.generateAuthTokens(user);
    console.log('tokens');
    console.log(tokens);
    res.render('electron_login', {
      oauth: tokens,
    });

    // Forward user information to the next middleware
    req.user = user;
    // next();
  })(req, res, next);
};

module.exports = {
  register,
  login,
  loginErrors,
  appleLoginOrCreateAccount,
  googleLoginOrCreateAccount,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  authenticateGoogle,
  authenticateGoogleCallback,
  appleSignInWebHook,
};
