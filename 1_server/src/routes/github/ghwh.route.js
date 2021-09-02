const express = require('express');
const httpError = require('http-errors');
const httpStatus = require('http-status');
const { signer } = require('x-hub-signature');
const { exec } = require('child_process');
const {
  enviaStringComoArquivoNoTelegram,
  enviaNotificacaoSite,
  enviaNotificacaoApi,
  canais,
} = require('../../utils/notify');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const catchAsync = require('../../utils/catchAsync');

const router = express.Router();
const SECRET_CONFIGURADO_NO_GITHUB = 'SECRET_CONFIGURADO_NO_GITHUB';

const verifySignature = function (req, res, next) {
  const sign = signer({ algorithm: 'sha1', secret: SECRET_CONFIGURADO_NO_GITHUB });
  const { rawBody } = req;
  if (!rawBody) {
    enviaNotificacaoApi(
      'Falha na configuração do  github webhook x-hub-signature, alguem tirou o app.use(express.json({ verify: webhookMiddleware.extractRawBody }));'
    );
    return next(httpError(500, 'Missing req.rawBody, see the x-hub-signature readme'));
  }

  const signature = req.header('X-Hub-Signature');

  if (!signature) {
    enviaNotificacaoApi('Falha na configuração do github webhook Missing X-Hub-Signature header');
    return next(httpError(400, 'Missing X-Hub-Signature header'));
  }
  if (signature) {
    const body = Buffer.from(rawBody);

    if (signature !== sign(body)) {
      enviaNotificacaoApi(
        'Falha no github webhook A assinatura nao bateu, alguem tentando algo indevido? Ou voce mudou o secret no site do github?'
      );
      return next(httpError(400, 'Invalid X-Hub-Signature'));
    }
  }
  return true;
};
const githubWebhook = catchAsync(async (req, res) => {
  const GITHUB_REPOSITORIES_TO_DIR = {
    'rwieruch/my-website-one-on-github': '/opt/reactbuildtemp',
    'rwieruch/my-website-two-on-github': '/home/rwieruch/my-website-two',
  };
  const directory = GITHUB_REPOSITORIES_TO_DIR[req.body?.repository?.full_name];

  enviaStringComoArquivoNoTelegram(canais.PocketDeployApi, canais.PocketDeployApi, 'ARQUIVO DE TESTE\n');
  if (await verifySignature(req)) {
    // console.log(req.body);

    const isMaster = req.body?.ref === 'refs/heads/master';
    const isReleaseBackend = req.body?.ref === 'refs/heads/release_backend';
    const isReleaseFrontend = req.body?.ref === 'refs/heads/release_frontend';

    if (isReleaseBackend) {
      enviaNotificacaoApi('Novo release do backend, instalando codigo novo...', canais.PocketDeployApi);
      try {
        exec(`cd /opt/POCKETCLOUD/SCRIPTS && bash 99_installapi.sh`);
      } catch (error) {
        enviaNotificacaoApi('Erro no try/catch na hora da execucao do 99_installapi.sh ', canais.PocketDeployApi);
        console.log(error);
      }
    }

    if (isReleaseFrontend) {
      try {
        enviaNotificacaoSite('Novo release do frontend,a buildando e instalando codigo novo', canais.PocketDeploySite);
        exec(`cd /opt/POCKETCLOUD/SCRIPTS && bash 99_installfrontend.sh`);
      } catch (error) {
        enviaNotificacaoSite('Erro no try/catch na hora da execucao do 99_installfrontend.sh ', canais.PocketDeploySite);
        console.log(error);
      }
    }

    if (isMaster && directory) {
      try {
        exec(`cd ${directory} && bash deployaa.sh`);
      } catch (error) {
        console.log(error);
      }
    }

    res.status(httpStatus.OK).send();
  } else {
    console.log('Erro na verificação de assinatura de comunicação com o github ');
    enviaNotificacaoApi('Erro na verificação de assinatura de comunicação com o github');
  }
});

router.post('/githubwebhook', validate(authValidation.githubWebhook), githubWebhook);

module.exports = router;
