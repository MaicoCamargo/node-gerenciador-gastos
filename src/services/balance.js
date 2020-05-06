// const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  const getSaldo = async (userID) => {
    return app.db('transactions as t ').sum('amnount')
      .join('account as acc', 'acc.id', '=', 't.acc_id')
      .where({ user_id: userID, status: true })
      .where('date', '<=', new Date())
      .select('acc.id')
      .groupBy('acc.id')
      .orderBy('acc.id');
  };

  return { getSaldo };
};
