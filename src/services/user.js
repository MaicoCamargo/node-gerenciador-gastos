module.exports = (app) => {
  const findAll = () => {
    return app.db('user').select();
  };

  const save = (user) => {
    return app.db('user').insert(user, '*');
  };

  return { save, findAll };
};
