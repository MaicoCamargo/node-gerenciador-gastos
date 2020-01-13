module.exports = (app) => {
  const findAll = () => {
    return app.db('user').select();
  };

  const save = (user) => {
    if (!user.nome) return { error: 'Nome é um atributo obrigatório' };
    return app.db('user').insert(user, '*');
  };

  return { save, findAll };
};
