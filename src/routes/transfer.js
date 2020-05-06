const express = require('express');
const RecursoIndevidoError = require('../errors/recursoIndevidoError');

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

  /*----------------------
    - middleware que valida se o recurso que esta sendo acessado pertence ao usuario da requisição
      que esta no token
  * ----------------------*/
  router.param('id', async (req, res, next) => {
    await app.services.transfer.findOne({ id: req.params.id }).then((recurso) => {
      if (recurso.user_id !== req.user.id) throw new RecursoIndevidoError();
      else next();
    }).catch((err) => next(err));
  });


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

  router.delete('/:id', (req, res, next) => {
    app.services.transfer.remove(req.params.id)
      .then(() => res.status(204).send())
      .catch((error) => next(error));
  });

  return router;
};
