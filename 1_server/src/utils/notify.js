const { TelegramClient } = require('messaging-api-telegram');
const { MessengerClient } = require('messaging-api-messenger');
/**
 * Create an object composed of the picked object properties
 * @param {mensagem} Mensagem a ser enviada
 * @param {canal} keys
 * @returns {true}
 */
const enviaNotificacaoApi = (mensagem, canal = '1', enviaTelegram = true) => {
  if (enviaTelegram) {
    const client = new TelegramClient({
      // PUBSHARE BOT accessToken: '1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo',
      accessToken: '1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60', // PocketBot
    });

    let canalEscolhido;
    // Deixei isto aqui pra segmentar mensagens la do cliente.
    // Login/Suporte/ETC
    switch (canal) {
      case '1':
        // Pocket Api ==> -1001334222644
        canalEscolhido = '-1001334222644';
        break;
      default:
        canalEscolhido = '-1001334222644'; // Pocket Api
    }

    client
      .sendMessage(canalEscolhido, mensagem)
      .then(() => {
        console.log('enviaNotificacaoApi Telegram message sent');
      })
      .catch((error) => {
        const clientFb = new MessengerClient({
          accessToken:
            'EAAJJRoq0aY4BAJKbWv7h4e2COW8MReQZB3JDiY6iDdM9OVrLUoQPUSJju4hRXEHAQVGNKy6rLPNy9oIh3ozwKcdpj9X6B65fkfaQ8flEIWYF9xGKIHRMQbQvNiIzJAqlkgA9uZCO4dbu4EXhIWxDo0yGGrp5GlMHDhf8IirOoaHXH5pvcckWjs1H0E1rTgODEJ6XchXQZDZD',
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
const enviaNotificacaoSite = (mensagem, canal = '1', enviaTelegram = true) => {
  const client = new TelegramClient({
    // PUBSHARE BOT accessToken: '1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo',
    accessToken: '1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60', // PocketBot
  });

  if (enviaTelegram) {
    let canalEscolhido;
    // Deixei isto aqui pra segmentar mensagens la do cliente.
    // Login/Suporte/ETC
    switch (canal) {
      case '1':
        // Pocket Site ==> -1001419540370
        canalEscolhido = '-1001419540370';
        break;
      case '2':
        // Pocket Novos Clientes ==> -1001317116760
        canalEscolhido = '-1001317116760';
        break;

      default:
        canalEscolhido = '-1001419540370'; // Pocket Site
    }

    client
      .sendMessage(canalEscolhido, mensagem)
      .then(() => {
        console.log('enviaNotificacaoSite Telegram message sent');
      })
      .catch((error) => {
        console.log('enviaNotificacaoSite Telegram message falhou');
        const clientFb = new MessengerClient({
          accessToken:
            'EAAJJRoq0aY4BAJKbWv7h4e2COW8MReQZB3JDiY6iDdM9OVrLUoQPUSJju4hRXEHAQVGNKy6rLPNy9oIh3ozwKcdpj9X6B65fkfaQ8flEIWYF9xGKIHRMQbQvNiIzJAqlkgA9uZCO4dbu4EXhIWxDo0yGGrp5GlMHDhf8IirOoaHXH5pvcckWjs1H0E1rTgODEJ6XchXQZDZD',
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
const enviaNotificacaoAplicativo = (mensagem, canal = '1', enviaTelegram = true) => {
  const client = new TelegramClient({
    // PUBSHARE BOT accessToken: '1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo',
    accessToken: '1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60', // PocketBot
  });

  if (enviaTelegram) {
    let canalEscolhido;
    // Deixei isto aqui pra segmentar mensagens la do cliente.
    // Login/Suporte/ETC
    switch (canal) {
      case '1':
        // Pocket Aplicativo ==> -1001309705197
        canalEscolhido = '-1001309705197';
        break;
      default:
        canalEscolhido = '-1001309705197'; // Pocket Aplicativo
    }

    client
      .sendMessage(canalEscolhido, mensagem)
      .then(() => {
        console.log('enviaNotificacaoSite Telegram message sent');
      })
      .catch((error) => {
        console.log('enviaNotificacaoSite Telegram message falhou');
        const clientFb = new MessengerClient({
          accessToken:
            'EAAJJRoq0aY4BAJKbWv7h4e2COW8MReQZB3JDiY6iDdM9OVrLUoQPUSJju4hRXEHAQVGNKy6rLPNy9oIh3ozwKcdpj9X6B65fkfaQ8flEIWYF9xGKIHRMQbQvNiIzJAqlkgA9uZCO4dbu4EXhIWxDo0yGGrp5GlMHDhf8IirOoaHXH5pvcckWjs1H0E1rTgODEJ6XchXQZDZD',
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
};
