import 'dotenv/config';
import http from 'http';
import crypto from 'crypto';
import { exec } from 'child_process';

const USER_PATH = '/opt/POCKETCLOUD/';

// COPIADO DE https://github.com/rwieruch/github-webhook-automatic-blog-deployment
const GITHUB_TO_DIR = {
  'leopucci/pocketcloud': [
    `${USER_PATH}/BACKENDAPI/server`,
  ],
};

http
  .createServer((req, res) => {
    req.on('data', (chunk) => {
      const signature = `sha1=${crypto
        .createHmac('sha1', process.env.SECRET)
        .update(chunk)
        .digest('hex')}`;

      const isAllowed = req.headers['x-hub-signature'] === signature;

      const body = JSON.parse(chunk);

      const isMaster = body?.ref === 'refs/heads/master';
      const isReleaseBackend = req.body?.ref === 'refs/heads/release_backend';
    const isReleaseFrontend = req.body?.ref === 'refs/heads/release_frontend';

      const directory = GITHUB_TO_DIR[body?.repository?.full_name];
 if (isReleaseBackend && directory && directory.length) {
      enviaNotificacaoApi('Novo release do backend, instalando codigo novo...', canais.PocketDeployApi);
       try {
          directory.forEach((entry) =>
            exec(`cd ${entry} && bash 99_installapi.sh &`)
          );
          console.log(directory);
        } catch (error) {
          console.log(error);
        }
    }
     if (isReleaseFrontend && directory && directory.length) {
      enviaNotificacaoSite('Novo release do frontend,a buildando e instalando codigo novo', canais.PocketDeploySite);
       try {
          directory.forEach((entry) =>
            exec(`cd ${entry} && bash 99_installapi.sh &`)
          );
          console.log(directory);
        } catch (error) {
          console.log(error);
        }
    }
    });

    res.end();
  })
  .listen(3721);
