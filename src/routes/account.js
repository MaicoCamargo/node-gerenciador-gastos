module.exports = (app) => {
  const findAll = (req, res, next) => {
    return app.services.account.find()
      .then((result) => res.status(200).json(result))
      .catch((error) => next(error));
  };

  const create = (req, res, next) => {
    app.services.account.save(req.body).then((result) => {
      return res.status(201).json(result[0]);
    }).catch((error) => next(error));
  };

  const findById = (req, res, next) => {
    app.services.account.find({ id: req.params.id })
      .then((result) => res.status(200).json(result[0]))
      .catch((error) => next(error));
  };

  const update = (req, res, next) => {
    app.services.account.update(req.params.id, req.body)
      .then((result) => res.status(200).json(result[0]))
      .catch((error) => next(error));
  };

  const remove = (req, res, next) => {
    app.services.account.deletar(req.params.id)
      .then(() => res.status(204).send())
      .catch((error) => next(error));
  };

  return {
    findAll, create, findById, update, remove,
  };
};
