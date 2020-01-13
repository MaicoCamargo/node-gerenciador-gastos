module.exports = (app) => {
  const findAll = (filter = {}) => {
    return app.db('user').where(filter).select();
  };

  const save = async (user) => {
    if (!user.nome) return { error: 'Nome é um atributo obrigatório' };
    if (!user.mail) return { error: 'Email é um atributo obrigatório' };
    if (!user.passwd) return { error: 'Senha é um atributo obrigatório' };

    const userDB = await findAll({ mail: user.mail });
    if (userDB && userDB.length) return { error: 'Já existe um usuario com esse email' };

    return app.db('user').insert(user, '*');
  };

  return { save, findAll };
};
