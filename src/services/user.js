const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  const findAll = (filter = {}) => {
    return app.db('user').where(filter).select(['nome', 'mail', 'id']);
  };

  const save = async (user) => {
    if (!user.nome) throw new ValidationError('Nome é um atributo obrigatório');
    if (!user.mail) throw new ValidationError('Email é um atributo obrigatório');
    if (!user.passwd) throw new ValidationError('Senha é um atributo obrigatório');

    const userDB = await findAll({ mail: user.mail });
    if (userDB && userDB.length) throw new ValidationError('Já existe um usuario com esse email');

    return app.db('user').insert(user, ['nome', 'mail', 'id']);
  };

  return { save, findAll };
};
