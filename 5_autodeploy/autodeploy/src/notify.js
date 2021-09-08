const rax = require('retry-axios');
const { v1: uuidv1 } = require('uuid');
const { TelegramClient } = require('messaging-api-telegram');
const { MessengerClient } = require('messaging-api-messenger');
const fs = require('fs');
const safeJsonStringify = require('safe-json-stringify');
const PDFKit = require('pdfkit');

const canais = {
  PocketApi: '-1001334222644',
  PocketSite: '-1001419540370',
  PocketAplicativo: '-1001309705197',
  PocketDeployApi: '-1001163173913',
  PocketDeployApiPM2: '-1001507578888',
  PocketDeploySite: '-1001177781241',
  PocketNovosClientes: '-1001317116760',
  PocketHttpErros: '-1001555803951',
  PocketHttp400BadRequest: '-1001515434153',
  PocketHttp401Unauthorized: '-1001505087466',
  PocketHttp404NotFound: '-1001556443099',
  PocketHttp500InternalServerError: '-1001569170107',
};
const bot = {
  PocketBot: { username: 'Pocket_robot_bot', accessToken: '1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60' },
};
const FacebookAccessToken = {
  accessToken:
    'EAAJJRoq0aY4BAJKbWv7h4e2COW8MReQZB3JDiY6iDdM9OVrLUoQPUSJju4hRXEHAQVGNKy6rLPNy9oIh3ozwKcdpj9X6B65fkfaQ8flEIWYF9xGKIHRMQbQvNiIzJAqlkgA9uZCO4dbu4EXhIWxDo0yGGrp5GlMHDhf8IirOoaHXH5pvcckWjs1H0E1rTgODEJ6XchXQZDZD',
};
/**
 * Create an object composed of the picked object properties
 * @param {mensagem} Mensagem a ser enviada
 * @param {canal} keys
 * @returns {true}
 */
const enviaNotificacaoApi = (mensagem, canal = canais.PocketApi, enviaTelegram = true) => {
  if (enviaTelegram) {
    const client = new TelegramClient({
      // PUBSHARE BOT accessToken: '1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo',
      accessToken: bot.PocketBot.accessToken, // PocketBot
    });
    client.axios.defaults.raxConfig = {
      instance: client.axios,
    };
    // eslint-disable-next-line no-unused-vars
    const interceptorId = rax.attach(client.axios);
    const canalEscolhido = canal;

    client
      .sendMessage(canalEscolhido, mensagem)
      .then(() => {
        console.log('enviaNotificacaoApi Telegram message sent');
      })
      .catch((error) => {
        const clientFb = new MessengerClient({
          accessToken: FacebookAccessToken.accessToken,
        });

        let formatedError;
        if (error.response) {
          // Request made and server responded
          formatedError.concat(error.response.status, ' ', error.response.data, ' ', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          formatedError.concat(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          formatedError.concat(error.message);
        }

        clientFb
          .sendText('100000350602373', `Hello World : ${formatedError}`)
          .then(() => {
            console.log('enviaNotificacaoApi sent');
          })
          .catch((error2) => {
            console.log(`FBMESSENGER error: ${error2}`);
          });
      });
  }
};

/**
 * Create an object composed of the picked object properties
 * @param {mensagem} Mensagem a ser enviada
 * @param {canal} keys
 * @returns {true}
 */
const enviaStringComoArquivoNoTelegram = (
  mensagem,
  canal = canais.PocketApi,
  arquivo,
  fileName = uuidv1(),
  descricao = 'Descricao'
) => {
  const client = new TelegramClient({
    // PUBSHARE BOT accessToken: '1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo',
    accessToken: bot.PocketBot.accessToken, // PocketBot
  });
  client.axios.defaults.raxConfig = {
    instance: client.axios,
  };
  // eslint-disable-next-line no-unused-vars
  const interceptorId = rax.attach(client.axios);

  const fileExtension = '.pdf';
  const fileCompleteName = fileName + fileExtension;
  const fileHttpAddress = `${
    process.env.API_BASE_URL.endsWith('/') ? process.env.API_BASE_URL.slice(0, -1) : process.env.API_BASE_URL
  }/temp/${fileCompleteName}`;
  const fileSystemAddress = `${__dirname}/../../public/${fileCompleteName}`;

 console.log(`Tentando criar arquivo  ${fileHttpAddress}\n\n PATH: ${fileSystemAddress}`);
  const pdf = new PDFKit();
  pdf.text(arquivo);
  try {
    pdf.pipe(fs.createWriteStream(fileSystemAddress));
    pdf.end();
  } catch (error) {
    console.log(` Erro tentando criar arquivo em disco: \n${fileSystemAddress}`);
  }
  if (fileHttpAddress.contains('localhost')) {
    console.log(` Erro tentando criar documento para telegram, localhost nao é acessivel. Ignorando... `);
    return;
  }
  client
    .sendDocument(canal, fileHttpAddress, {
      caption: descricao,
    })
    .then(() => {
      console.log('enviaArquivo Telegram arquivo sent');
    })
    .catch((error) => {
      const clientFb = new MessengerClient({
        accessToken: FacebookAccessToken.accessToken,
      });
      console.log(safeJsonStringify(error));

      clientFb
        .sendText('100000350602373', `Erro enviando arquivo pelo telegram: canal: ${canal} \n${fileCompleteName}`)
        .then(() => {
          console.log('Envia arquivo deu certo sent');
        })
        .catch((error2) => {
          console.log(
            `ERRO no fallback pro facebook messenger, mensagem nao enviada ${fileCompleteName} \n ${safeJsonStringify(
              error2
            )}`
          );
        });
    });
};

/**
 * Create an object composed of the picked object properties
 * @param {mensagem} Mensagem a ser enviada
 * @param {canal} keys
 * @returns {true}
 */
const enviaNotificacaoSite = (mensagem, canal = canais.PocketSite, enviaTelegram = true) => {
  const client = new TelegramClient({
    // PUBSHARE BOT accessToken: '1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo',
    accessToken: bot.PocketBot.accessToken, // PocketBot
  });
  client.axios.defaults.raxConfig = {
    instance: client.axios,
  };
  // eslint-disable-next-line no-unused-vars
  const interceptorId = rax.attach(client.axios);
  if (enviaTelegram) {
    const canalEscolhido = canal;

    client
      .sendMessage(canalEscolhido, mensagem)
      .then(() => {
        console.log('enviaNotificacaoSite Telegram message sent');
      })
      .catch((error) => {
        console.log('enviaNotificacaoSite Telegram message falhou');
        const clientFb = new MessengerClient({
          accessToken: FacebookAccessToken.accessToken,
        });
        const formatedError = [];
        if (error.response) {
          // Request made and server responded
          formatedError.concat(error.response.status, ' ', error.response.data, ' ', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          formatedError.concat(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          formatedError.concat(error.message);
        }

        clientFb
          .sendText('100000350602373', `Hello World : ${formatedError}`)
          .then(() => {
            console.log('enviaNotificacaoSite FACEBOOK message sent');
          })
          .catch((error2) => {
            console.log(`FBMESSENGER error: ${error2}`);
          });
      });
  }
};

/**
 * Create an object composed of the picked object properties
 * @param {mensagem} Mensagem a ser enviada
 * @param {canal} keys
 * @returns {true}
 */
const enviaNotificacaoAplicativo = (mensagem, canal = canais.PocketAplicativo, enviaTelegram = true) => {
  const client = new TelegramClient({
    // PUBSHARE BOT accessToken: '1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo',
    accessToken: bot.PocketBot.accessToken, // PocketBot
  });
  client.axios.defaults.raxConfig = {
    instance: client.axios,
  };
  // eslint-disable-next-line no-unused-vars
  const interceptorId = rax.attach(client.axios);
  if (enviaTelegram) {
    const canalEscolhido = canal;

    client
      .sendMessage(canalEscolhido, mensagem)
      .then(() => {
        console.log('enviaNotificacaoAplicativo Telegram message sent');
      })
      .catch((error) => {
        console.log('enviaNotificacaoAplicativo Telegram message falhou');
        const clientFb = new MessengerClient({
          accessToken: FacebookAccessToken.accessToken,
        });
        const formatedError = [];
        if (error.response) {
          // Request made and server responded
          formatedError.concat(error.response.status, ' ', error.response.data, ' ', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          formatedError.concat(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          formatedError.concat(error.message);
        }

        clientFb
          .sendText('100000350602373', `Hello World : ${formatedError}`)
          .then(() => {
            console.log('sent');
          })
          .catch((error2) => {
            console.log(`FBMESSENGER error: ${error2}`);
          });
      });
  }
};

/**
 * Create an object composed of the picked object properties
 * @param {mensagem} Mensagem a ser enviada
 * @param {canal} keys
 * @returns {true}
 */
const enviaNotificacaoPorId = (mensagem, canal = canais.PocketAplicativo, enviaTelegram = true) => {
  const client = new TelegramClient({
    // PUBSHARE BOT accessToken: '1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo',
    accessToken: bot.PocketBot.accessToken, // PocketBot
  });
  client.axios.defaults.raxConfig = {
    instance: client.axios,
  };
  // eslint-disable-next-line no-unused-vars
  const interceptorId = rax.attach(client.axios);
  if (enviaTelegram) {
    let canalEscolhido;

    switch (canal) {
      case 1:
        canalEscolhido = canais.PocketSite;
        break;
      case 2:
        canalEscolhido = canais.PocketApi;
        break;
      default:
        enviaNotificacaoSite('Erro no notify.js:enviaNotificacaoPorId, esta caindo no default', canais.PocketSite);
        canalEscolhido = canais.PocketSite;
    }
    client
      .sendMessage(canalEscolhido, mensagem)
      .then(() => {
        console.log('enviaNotificacaoSite Telegram message sent');
      })
      .catch((error) => {
        console.log('enviaNotificacaoSite Telegram message falhou');
        const clientFb = new MessengerClient({
          accessToken: FacebookAccessToken.accessToken,
        });
        const formatedError = [];
        if (error.response) {
          // Request made and server responded
          formatedError.concat(error.response.status, ' ', error.response.data, ' ', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          formatedError.concat(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          formatedError.concat(error.message);
        }

        clientFb
          .sendText('100000350602373', `Hello World : ${formatedError}`)
          .then(() => {
            console.log('sent');
          })
          .catch((error2) => {
            console.log(`FBMESSENGER error: ${error2}`);
          });
      });
  }
};

module.exports = {
  enviaNotificacaoApi,
  enviaNotificacaoSite,
  enviaNotificacaoAplicativo,
  enviaNotificacaoPorId,
  enviaStringComoArquivoNoTelegram,
  canais,
};
