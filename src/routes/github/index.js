const express = require('express');
const logger = require('../../config/logger');
const githubRoute = require('./ghwh.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/ghwh',
    route: githubRoute,
  },
];

defaultRoutes.forEach((route) => {
  logger.info(`Configuring ${route.path}`);
  router.use(route.path, route.route);
});

module.exports = router;
