const canais = {
  PocketApi: '-1001334222644',
  PocketSite: '-1001419540370',
  PocketAplicativo: '-1001309705197',
  PocketDeployApi: '-1001163173913',
  PocketDeployApiPM2: '-1001507578888',
  PocketDeploySite: '-1001177781241',
  PocketNovosClientes: '-1001317116760',
};
const bot = {
  PocketBot: { username: 'Pocket_robot_bot', accessToken: '1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60' },
};
const FacebookAccessToken = {
  accessToken:
    'EAAJJRoq0aY4BAJKbWv7h4e2COW8MReQZB3JDiY6iDdM9OVrLUoQPUSJju4hRXEHAQVGNKy6rLPNy9oIh3ozwKcdpj9X6B65fkfaQ8flEIWYF9xGKIHRMQbQvNiIzJAqlkgA9uZCO4dbu4EXhIWxDo0yGGrp5GlMHDhf8IirOoaHXH5pvcckWjs1H0E1rTgODEJ6XchXQZDZD',
};
const rax = require('retry-axios');
const { TelegramClient } = require('messaging-api-telegram');
const { MessengerClient } = require('messaging-api-messenger');
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
  canais,
};
