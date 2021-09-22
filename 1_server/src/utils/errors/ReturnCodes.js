// A ideia é travar a aplicação em cima destes codigos,
// La na UI, quando faz uma chamada pra API, tem que retornar o codigo certo, pra interface saber o que fazer
// Ela vai se basear neste codigo, e nao se foi sucesso ou erro...
// Isto aqui serve pra eu segmentar dentro do success http 200 e error quais os tipos de erro e como que a ui vai lidar.
// É um casamento entre a UI e a API, sabendo exatamente o que cada coisa faz
// Na hora que eu colocar varias linguas, da pra debugar o erro só pelo codigo, assim sei o que aconteceu porque tem o
// codigo embutido na mensagem
const ReturnCodes = {
  ErrorCodes: {
    LOGIN_ERROR_EMAIL_NOT_VERIFIED: 400,

    VERIFY_EMAIL_TOKEN_EXPIRED: 400,
    VERIFY_EMAIL_TOKEN_MALFORMED: 400,
    VERIFY_EMAIL_TOKEN_NOT_FOUND: 400,

    RESET_PASSWORD_TOKEN_EXPIRED: 400,
    RESET_PASSWORD_TOKEN_MALFORMED: 400,
    RESET_PASSWORD_TOKEN_NOT_FOUND: 400,
  },
  SuccessCodes: {
    CLIENT_ERROR_BAD_REQUEST: 400,
    CLIENT_ERROR_UNAUTHORIZED: 401,
    API_NOT_FOUND: 404,
  },
};
module.exports = ReturnCodes;
