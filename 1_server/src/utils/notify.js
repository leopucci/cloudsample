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
        canalEscolhido = '@pocketapi';
        break;
      default:
        canalEscolhido = '@pocketapi';
    }

    client
      .sendMessage(canalEscolhido, mensagem)
      .then(() => {
        console.log('enviaNotificacaoApi Telegram message sent');
      })
      .catch((error) => {
        const clientFb = new MessengerClient({
          accessToken:
            'EAAFC09mX2OQBAHLGdy9QOwww9AEEzCkgRZBXZACTD1M6rU1E6hFiqtIDmQnMqJqlTjoW32qTT0enY2DtSopIZChQazthIZAeTYyoiTmAR1YLzWmwLCIAekPcZBPsWkkaSTzbEZCg7OZBvp7hsB8zbbinruhZCg6ddRrIJZAUsfMwnNFuqTcR6MxTtub0k8sMsWzQQNJD8S2kiEwZDZD',
        });

        clientFb
          .sendText('leonardojcpucci', `Hello World : ${JSON.stringify(error)}`)
          .then(() => {
            console.log('sent');
          })
          .catch((error) => {
            console.log(`FBMESSENGER error: ${error}`);
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
        canalEscolhido = '@pocketsite';
        break;
      default:
        canalEscolhido = '@pocketsite';
    }
    const clientFb = new MessengerClient({
      accessToken:
        'EAAFC09mX2OQBAHLGdy9QOwww9AEEzCkgRZBXZACTD1M6rU1E6hFiqtIDmQnMqJqlTjoW32qTT0enY2DtSopIZChQazthIZAeTYyoiTmAR1YLzWmwLCIAekPcZBPsWkkaSTzbEZCg7OZBvp7hsB8zbbinruhZCg6ddRrIJZAUsfMwnNFuqTcR6MxTtub0k8sMsWzQQNJD8S2kiEwZDZD',
    });

    clientFb
      .sendText('100000350602373', `Hello World :`)
      .then(() => {
        console.log('sent');
      })
      .catch((error) => {
        console.log(`FBMESSENGER error: ${error}`);
      });
    client.sendMessage(canalEscolhido, mensagem).then(() => {
      console.log('enviaNotificacaoSite Telegram message sent');
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
        canalEscolhido = '@pocketaplicativo';
        break;
      default:
        canalEscolhido = '@pocketsite';
    }

    client.sendMessage(canalEscolhido, mensagem).then(() => {
      console.log('enviaNotificacaoSite Telegram message sent');
    });
  }
};

module.exports = {
  enviaNotificacaoApi,
  enviaNotificacaoSite,
  enviaNotificacaoAplicativo,
};
