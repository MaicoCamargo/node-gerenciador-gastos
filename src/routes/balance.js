const express = require('express');
// const RecursoIndevidoError = require('../errors/recursoIndevidoError');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    app.services.balance.getSaldo(req.user.id)
      .then((result) => res.status(200).json(result))
      .catch((error) => next(error));
  });

  return router;
};
