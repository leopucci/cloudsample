const { TelegramClient } = require('messaging-api-telegram');

/**
 * Create an object composed of the picked object properties
 * @param {mensagem} Mensagem a ser enviada
 * @param {canal} keys
 * @returns {true}
 */
const enviaNotificacaoApi = (mensagem, canal = '@pocketapi', enviaTelegram = true) => {
  if (enviaTelegram) {
    const client = new TelegramClient({
      accessToken: '1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo',
    });

    client.sendMessage(canal, mensagem).then(() => {
      console.log('enviaNotificacaoApi Telegram message sent');
    });
  }
};

/**
 * Create an object composed of the picked object properties
 * @param {mensagem} Mensagem a ser enviada
 * @param {canal} keys
 * @returns {true}
 */
const enviaNotificacaoSite = (mensagem, canal = '@pocketsite', enviaTelegram = true) => {
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
    const client = new TelegramClient({
      accessToken: '1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo',
    });

    client.sendMessage(canalEscolhido, mensagem).then(() => {
      console.log('enviaNotificacaoSite Telegram message sent');
    });
  }
};

module.exports = {
  enviaNotificacaoApi,
  enviaNotificacaoSite,
};
