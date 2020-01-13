module.exports = (app) => {
  const findAll = () => {
    return app.db('user').select();
  };

  const save = (user) => {
    if (!user.nome) return { error: 'Nome é um atributo obrigatório' };
    if (!user.mail) return { error: 'Email é um atributo obrigatório' };
    if (!user.passwd) return { error: 'Senha é um atributo obrigatório' };
    return app.db('user').insert(user, '*');
  };

  return { save, findAll };
};
