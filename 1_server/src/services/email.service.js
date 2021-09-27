const nodemailer = require('nodemailer');
const Email = require('email-templates');
const path = require('path');
const { I18n } = require('i18n');
const safeJsonStringify = require('safe-json-stringify');
const config = require('../config/config');
const logger = require('../config/logger');
const { enviaNotificacaoApi } = require('../utils/notify');

const transport = nodemailer.createTransport(config.email.smtp);

/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info(`Connected to email server ${config.email.smtp.auth}`))
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
    directory: path.join(__dirname, 'email_locales'),
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
    .then(logger.debug(`Email sent to ${to} with token ${locals.token}`))
    .catch((error) => {
      enviaNotificacaoApi(`Erro enviando e-mail pra ${to} error${safeJsonStringify(error.message)}`);
      logger.error(`Erro enviando e-mail pra ${to} error${safeJsonStringify(error.message)}`);
    });

  // const msg = { from: config.email.from, to, subject, text };
  // await transport.sendMail(msg);
};

/**
 * Send welcome email and ask to confirm email address
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendEmailConfirmationAndWelcome = async (to, token, firstName, locale) => {
  const confirmationUrl = `${config.email.baseUrl}/confirmemail/${token}`;
  const locals = {
    locale,
    name: firstName,
    confirmationUrl,
  };

  await sendEmail(to, 'emailconfirmationwandelcome', locals);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token, firstName, locale) => {
  const resetPasswordUrl = `${config.email.baseUrl}/resetpassword/${token}`;
  const locals = {
    locale,
    name: firstName,
    resetPasswordUrl,
  };

  await sendEmail(to, 'resetpassword', locals);
};
module.exports = {
  transport,
  sendResetPasswordEmail,
  sendEmailConfirmationAndWelcome,
};
