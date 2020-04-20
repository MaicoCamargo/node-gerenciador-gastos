const express = require('express');

module.exports = (app) => {
  const router = express.Router();

  router.get('/', (req, res, next) => {
    app.services.user.findAll()
      .then((result) => { res.status(200).json(result); })
      .catch((error) => next(error));
  });

  router.post('/', async (req, res, next) => {
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
