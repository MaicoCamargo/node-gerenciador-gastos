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

  return { findAll, create, findById };
};
