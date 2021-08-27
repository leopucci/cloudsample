const express = require('express');
const githubRoute = require('./ghwh.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/ghwh',
    route: githubRoute,
  },
];

defaultRoutes.forEach((route) => {
  console.log(`Configuring ${route.path}`);
  router.use(route.path, route.route);
});

module.exports = router;
