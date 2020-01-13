module.exports = (app) => {
  const findAll = (req, res) => {
    return app.services.account.find().then((result) => res.status(200).json(result));
  };

  const create = (req, res) => {
    app.services.account.save(req.body).then((result) => {
      return res.status(201).json(result[0]);
    });
  };

  const findById = (req, res) => {
    app.services.account.find({ id: req.params.id })
      .then((result) => res.status(200).json(result[0]));
  };

  const update = (req, res) => {
    app.services.account.update(req.params.id, req.body)
      .then((result) => res.status(200).json(result[0]));
  };

  const remove = (req, res) => {
    app.services.account.deletar(req.params.id).then(() => res.status(204));
  };

  return {
    findAll, create, findById, update, remove,
  };
};
