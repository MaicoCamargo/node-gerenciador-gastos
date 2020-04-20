const express = require('express');

module.exports = (app) => {
  // rotas de autenticação
  app.use('/auth', app.routes.auth);

  // rotas protegidas
  const protectedRouter = express.Router();
  protectedRouter.use('/user', app.routes.users);
  protectedRouter.use('/account', app.routes.account);

  app.use('/api', app.config.passport.authenticate(), protectedRouter);
};
