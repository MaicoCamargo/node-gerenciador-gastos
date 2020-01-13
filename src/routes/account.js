module.exports = (app) => {
  const findAll = (req, res) => {
    // TODO chamar service que busca todas as contas
    res.status(200).json(req.body);
  };

  const create = (req, res) => {
    app.services.account.save(req.body).then((result) => {
      return res.status(201).json(result[0]);
    });
  };

  return { findAll, create };
};
