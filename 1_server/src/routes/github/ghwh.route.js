const express = require('express');
const Joi = require('joi');
const httpStatus = require('http-status');
const validate = require('../../middlewares/validate');

const router = express.Router();

const githubWebhookvalidation = {
  body: Joi.object().keys({
    payload: Joi.string().required(),
  }),
};

const githubWebhook = async (req, res) => {
  console.log(req.body);
  // const { payload } = req.body;
  // await authService.appleSignInWebHook(payload);
  res.status(httpStatus.OK).send();
};

router.post('/githubwebhook', githubWebhook);

module.exports = router;
