module.exports = (app) => {
  const findAll = () => {
    return app.db('account').select();
  };

  const save = (account) => {
    return app.db('account').insert(account, '*');
  };
  return { findAll, save };
};
