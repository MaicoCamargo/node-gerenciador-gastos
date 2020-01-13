module.exports = (app) => {
  const find = (filter = { }) => {
    return app.db('account').where(filter).select();
  };

  const save = (account) => {
    return app.db('account').insert(account, '*');
  };

  const update = (id, account) => {
    return app.db('account').where({ id }).update(account, '*');
  };

  const deletar = (id) => {
    return app.db('account').where({ id }).del();
  };
  return {
    find, save, update, deletar,
  };
};
