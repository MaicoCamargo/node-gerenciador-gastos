module.exports = (app) => {
  const find = () => {
    return app.db('account').select();
  };

  const save = (account) => {
    return app.db('account').insert(account, '*');
  };
  return { find, save };
};
