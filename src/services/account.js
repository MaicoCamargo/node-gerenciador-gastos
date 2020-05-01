const ValidationError = require('../errors/validationError');


module.exports = (app) => {
  const find = (filter = {}) => {
    return app.db('account').where(filter).first();
  };

  const findAll = (userID) => {
    return app.db('account').where({ user_id: userID });
  };

  const save = async (account) => {
    if (!account.name) {
      throw new ValidationError('Nome é um campo obrigatório');
    }
    const jaExiste = await find({ name: account.name, user_id: account.user_id });
    if (jaExiste) {
      throw new ValidationError('Já existe uma conta com este nome');
    }

    return app.db('account').insert(account, '*');
  };

  const update = (id, account) => {
    return app.db('account').where({ id }).update(account, '*');
  };

  const deletar = async (id) => {
    const transactions = await app.services.transaction.findOne({ acc_id: id });
    if (transactions) throw new ValidationError('Essa conta possui transações');
    return app.db('account').where({ id }).del();
  };
  return { find, findAll, save, update, deletar };
};
