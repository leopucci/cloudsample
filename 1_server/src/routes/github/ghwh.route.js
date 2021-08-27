const express = require('express');
const Joi = require('joi');
const httpStatus = require('http-status');
const crypto = require('crypto');
const validate = require('../../middlewares/validate');
const webhookMiddleware = require('x-hub-signature').middleware;
const bodyParser = require('body-parser');

const router = express.Router();

const SECRET_CONFIGURADO_NO_GITHUB = 'SECRET_CONFIGURADO_NO_GITHUB';
const githubWebhook = async (req, res) => {
  // console.log(req.body);
  console.log(req.body);

  const isMaster = req.body?.ref === 'refs/heads/master';
  console.log(isMaster);

  const directory = GITHUB_REPOSITORIES_TO_DIR[body?.repository?.full_name];

  if (isAllowed && isMaster && directory) {
    try {
      exec(`cd ${directory} && bash deploy.sh`);
    } catch (error) {
      console.log(error);
    }
  }

  res.status(httpStatus.OK).send();
};

router.post(
  '/githubwebhook',
  webhookMiddleware({
    algorithm: 'sha1',
    secret: SECRET_CONFIGURADO_NO_GITHUB,
    require: true,
  }),
  githubWebhook
);

module.exports = router;
