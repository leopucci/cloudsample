const nodemailer = require('nodemailer');
const Email = require('email-templates');
const path = require('path');
const { I18n } = require('i18n');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);

/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, template, locals) => {
  const i18n = new I18n({
    // https://speakt.com/top-10-languages-used-internet/
    // aqui um exemplo +- de como integrar https://docusaurus.io/docs/2.0.0-beta.0/i18n/crowdin
    // lokalise parece ser mais completo que crowdin https://github.com/lokalise/i18n-ally
    // https://stackoverflow.com/a/28357857/3156756 lista de locales no javastript
    // https://en.wikipedia.org/wiki/Languages_used_on_the_Internet#Internet_users_by_language
    locales: ['en', 'ja', 'es', 'de', 'ru', 'fr', 'it', 'zh', 'pt', 'pt_BR', 'pl', 'ar', 'fa', 'id', 'nl', 'tr'],
    directory: path.join(__dirname, 'locales'),
  });

  const email = new Email({
    message: {
      from: config.email.from,
    },
    // uncomment below to send emails in development/test env:
    // send: true
    transport: {
      transport,
    },
    i18n,
    subjectPrefix: config.env === 'production' ? false : `[${config.env.toUpperCase()}] `,
    views: {
      options: {
        extension: 'ejs',
      },
    },
  });

  await email
    .send({
      template: path.join(__dirname, '../', 'views', 'emails', template),
      message: {
        to,
      },
      locals,
    })
    .then(console.log)
    .catch(console.error);

  // const msg = { from: config.email.from, to, subject, text };
  // await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send welcome email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendWelcomeConfirmationEmail = async (to, token, firstName, locale) => {
  const locals = {
    locale,
    name: firstName,
    token,
  };

  await sendEmail(to, 'signupwelcome', locals);
};

module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendWelcomeConfirmationEmail,
};
