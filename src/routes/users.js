module.exports = () => {
  const findAll = (req, res) => {
    const users = [{ nome: 'Maico Camargo' }];
    res.status(200).send(users);
  };

  const create = (req, res) => {
    res.status(201).send(req.body);
  };

  return { create, findAll };
};
