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
    if (!transaction.amnount) throw new ValidationError('valor é um campo obrigatório');
    if (!transaction.date) throw new ValidationError('data é um campo obrigatório');
    if (!transaction.type) throw new ValidationError('tipo é um campo obrigatório');
    if (!transaction.description) throw new ValidationError('descrição é um campo obrigatório');
    if (!(transaction.type === 'I' || transaction.type === 'O')) throw new ValidationError('tipo invalido');
    const newTransaction = { ...transaction };
    if ((transaction.type === 'I' && transaction.amnount < 0) || (transaction.type === 'O' && transaction.amnount > 0)) {
      newTransaction.amnount *= -1;
    }
    return app.db('transactions').insert(newTransaction, '*');
  };

  /**
   * retorna uma unica transação
   * @param filter - coluna e valor que devem ser usados no where
   * @return {*} - retorna a primeira transação encontrada na consulta
   */
  const findOne = (filter) => {
    return app.db('transactions').where(filter).first();
  };

  const update = (id, transaction) => {
    return app.db('transactions').where({ id }).update(transaction, '*');
  };

  const deletar = (id) => {
    return app.db('transactions').where({ id }).del();
  };

  return { find, save, findOne, update, deletar };
};
