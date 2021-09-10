const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const webhookMiddleware = require('x-hub-signature').middleware;
const safeJsonStringify = require('safe-json-stringify');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy, googleStrategy, appleStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const githubwebhookroute = require('./routes/github');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiNotFoundError = require('./utils/errors/ApiNotFoundError');

const app = express();
// este trust aqui eh pra fazer com que o ip que vem do Nginx
// via header seja usado como real, entao eu nao preciso modificar ou pegar o ip de lugar diferente
// e isto corrige os logs
app.set('trust proxy', 'loopback');

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
// este verify: webhookMiddleware.extractRawBody  foi adicionado para que
// ele preserve o raw, pro github hooks validar a assinatura la no arquivo ghwh.route.js
app.use(express.json({ verify: webhookMiddleware.extractRawBody }));

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

let corsOptions;
if (config.env === 'production') {
  corsOptions = {
    origin: 'http://www.pubshr.com',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
} else {
  corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };
}
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Pra renderizar a pagina do login no electron.
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);
passport.use('google', googleStrategy);
passport.use('apple', appleStrategy);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

app.use('/', githubwebhookroute);

// este public serve para eu mandar arquivos pro Telegram, salvo "publicamente" e envio
app.use('/temp', express.static('public'));

app.post('/ping', async (req, res) => {
  const date = new Date()
    .toISOString()
    .replace(/T/, ' ') // replace T with a space
    .replace(/\..+/, ''); // delete the dot and everything after

  res.send(`POST REQUEST ${date} \n PONG`);
});
app.get('/ping', async (req, res) => {
  const date = new Date()
    .toISOString()
    .replace(/T/, ' ') // replace T with a space
    .replace(/\..+/, ''); // delete the dot and everything after

  res.send(`GET REQUEST ${date} \n PONG`);
});

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiNotFoundError('Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
