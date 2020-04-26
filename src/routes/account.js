const express = require('express');
const RecursoIndevidoError = require('../errors/recursoIndevidoError');

module.exports = (app) => {
  const router = express.Router();

  /*----------------------
    - middleware que valida se o recurso que esta sendo acessado pertence ao usuario da requisição
      que esta no token
  * ----------------------*/
  router.param('id', async (req, res, next) => {
    await app.services.account.find({ id: req.params.id }).then((recurso) => {
      if (recurso.user_id !== req.user.id) throw new RecursoIndevidoError();
      else next();
    }).catch((err) => next(err));
  });

  router.get('/', (req, res, next) => {
    app.services.account.findAll(req.user.id)
      .then((result) => res.status(200).json(result))
      .catch((error) => next(error));
  });

  router.post('/', (req, res, next) => {
    /*-----------------------------------------
    *  req.user -> onde a lib passport joga os dados do usuario logado (dados do token)
    * user_id -> estratégia para o id ser sobreescrito
    * -----------------------------------------
    * */
    app.services.account.save({ ...req.body, user_id: req.user.id }).then((result) => {
      return res.status(201).json(result[0]);
    }).catch((error) => next(error));
  });

  router.get('/:id', (req, res, next) => {
    app.services.account.find({ id: req.params.id })
      .then((result) => res.status(200).json(result))
      .catch((error) => next(error));
  });

  router.put('/:id', (req, res, next) => {
    app.services.account.update(req.params.id, req.body)
      .then((result) => res.status(200).json(result[0]))
      .catch((error) => next(error));
  });

  router.delete('/:id', (req, res, next) => {
    app.services.account.deletar(req.params.id)
      .then(() => res.status(204).send())
      .catch((error) => next(error));
  });

  return router;
};
