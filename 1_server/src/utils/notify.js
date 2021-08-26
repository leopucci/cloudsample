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
      // PUBSHARE BOT accessToken: '1621388212:AAHVIiVUPKYzNidK5PdvMAQdRfDhaNATLwo',
      accessToken: '1942279280:AAEoxbNJvbJlG7ksHmI86pord-aMYxyFF60', // PocketBot
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

    client.sendMessage(canalEscolhido, mensagem).then(() => {
      console.log('enviaNotificacaoSite Telegram message sent');
    });
  }
};

module.exports = {
  enviaNotificacaoApi,
  enviaNotificacaoSite,
};
