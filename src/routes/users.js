module.exports = (app) => {
  const findAll = (req, res) => {
    app.db('user').select().then((result) => { res.status(200).json(result); });
  };

  const create = async (req, res) => {
    const result = await app.db('user').insert(req.body, '*');

    res.status(201).send(result[0]);
  };

  return { create, findAll };
};
