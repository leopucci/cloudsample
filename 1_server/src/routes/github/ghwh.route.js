const express = require('express');
const Joi = require('joi');
const httpStatus = require('http-status');
const crypto = require('crypto');
const validate = require('../../middlewares/validate');

const router = express.Router();

const githubWebhookvalidation = {
  body: Joi.object().keys({
    payload: Joi.string().required(),
  }),
};
const SECRET_CONFIGURADO_NO_GITHUB = 'SECRET';
const githubWebhook = async (req, res) => {
  // console.log(req.body);
  const signature = `sha1=${crypto.createHmac('sha1', SECRET_CONFIGURADO_NO_GITHUB).digest('hex')}`;

  const isAllowed = req.headers['x-hub-signature'] === signature;
  console.log(isAllowed);
  // const { payload } = req.body;
  // await authService.appleSignInWebHook(payload);
  res.status(httpStatus.OK).send();
};

router.post('/githubwebhook', githubWebhook);

module.exports = router;
