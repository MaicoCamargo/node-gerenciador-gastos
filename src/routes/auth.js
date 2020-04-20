const express = require('express');
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/validationError');
// TODO add o segredi no arquivo .env
const segredo = 'segredo';

module.exports = (app) => {
  const router = express.Router();

  /* autenticando um usuario */
  router.post('/signin', (req, res, next) => {
    app.services.user.findOne({ mail: req.body.mail })
      .then((usuario) => {
        if (!usuario) throw new ValidationError('Login Invalido');
        if (bcrypt.compareSync(req.body.passwd, usuario.passwd)) {
          const payload = {
            id: usuario.id,
            name: usuario.nome,
            mail: usuario.mail,
          };
          const token = jwt.encode(payload, segredo);
          res.status(200)
            .json({ token });
        } else throw new ValidationError('Login Invalido');
      })
      .catch((error) => next(error));
  });

  /* criando um novo usuario */
  router.post('/signup', async (req, res, next) => {
    try {
      const result = await app.services.user.save(req.body);
      if (result.error) { return res.status(400).json(result); }
      return res.status(201).json(result[0]);
    } catch (err) {
      return next(err);
    }
  });
  return router;
};
