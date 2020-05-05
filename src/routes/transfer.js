const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  /**
   * middleware de validação se os objeto da requisição tem todos os campos para ser salvo no banco
   * @param req - body com o JSON
   * @param res
   * @param next
   */
  const validation = (req, res, next) => {
    app.services.transfer.validate({ ...req.body, user_id: req.user.id })
      .then(() => next())
      .catch((error) => next(error));
  };

  router.get('/', (req, res, next) => {
    app.services.transfer.find({ user_id: req.user.id })
      .then((result) => res.status(200).json(result))
      .catch((error) => next(error));
  });

  router.post('/', validation, (req, res, next) => {
    app.services.transfer.save({ ...req.body, user_id: req.user.id })
      .then((result) => res.status(201).json(result[0]))
      .catch((error) => next(error));
  });

  router.get('/:id', (req, res, next) => {
    app.services.transfer.findOne({ id: req.params.id })
      .then((result) => res.status(200).json(result))
      .catch((error) => next(error));
  });

  router.put('/:id', validation, (req, res, next) => {
    app.services.transfer.update(req.params.id, req.body)
      .then((result) => res.status(200).json(result[0]))
      .catch((error) => next(error));
  });

  return router;
};
