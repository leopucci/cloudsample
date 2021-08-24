const fmt = require('fmt');
const axios = require('axios');
const rax = require('retry-axios');
const { enviaNotificacaoApi } = require('./notify');

const myAxiosInstance = axios.create();
myAxiosInstance.defaults.raxConfig = {
  instance: myAxiosInstance,
  retry: 4,
  noResponseRetries: 2,
  // statusCodesToRetry: [[100, 199], [429, 429], [500, 599]],
  onRetryAttempt: (err) => {
    try {
      console.info('Retrying request', err, rax.getConfig(err));
      enviaNotificacaoApi(`Retrying request err:${err} raxConfig: ${fmt.Sprintf('%v', rax.getConfig(err))}`);
    } catch (e) {
      throw new Error(`Axioshttp.js: Error logging the retry of a request: ${e}`);
    }
  },
};
// eslint-disable-next-line no-unused-vars
const interceptorId = rax.attach(myAxiosInstance);

module.exports = myAxiosInstance;
