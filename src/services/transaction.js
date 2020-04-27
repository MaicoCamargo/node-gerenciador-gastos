const ValidationError = require('../errors/validationError');


module.exports = (app) => {
  /**
   * retorna as transacoes de um determinado usuário
   * @param userID - usuario
   * @param filter - filtro de uma busca
   * @return {*|void|string} - lista de transações
   */
  const find = (userID, filter = {}) => {
    return app.db('transactions')
      .join('account', 'account.id', 'acc_id')
      .where(filter)
      .andWhere('account.user_id', userID)
      .select();
  };

  /**
   * criar uma nova transação
   * @param transaction - nova transaçao
   * @return {*} - nova transação salva no banco
   */
  const save = (transaction) => {
    return app.db('transactions').insert(transaction, '*');
  };

  return { find, save };
};
