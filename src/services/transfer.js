const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  const find = (filter = {}) => {
    return app.db('transfers').where(filter).select();
  };

  const findOne = (filter = {}) => {
    return app.db('transfers').where(filter).first();
  };

  const save = async (transferencia) => {
    if (!transferencia.description) throw new ValidationError('Descrição é um campo obrigatório');
    if (!transferencia.data) throw new ValidationError('Data é um campo obrigatório');
    if (!transferencia.ammount) throw new ValidationError('Valor é um campo obrigatório');
    if ((!transferencia.acc_ori_id) || (!transferencia.acc_dest_id)) throw new ValidationError('Conta é um campo obrigatório');
    if (transferencia.acc_ori_id === transferencia.acc_dest_id) throw new ValidationError('Conta origem e destino não podem ser iguais');

    const contas = await app.db('account').whereIn('id', [transferencia.acc_dest_id, transferencia.acc_ori_id]);
    contas.forEach((conta) => {
      if (conta.user_id !== parseInt(transferencia.user_id, 10)) {
        throw new ValidationError('Uma ou ambas contas não pertencem a este usuário');
      }
    });

    const result = await app.db('transfers').insert(transferencia, '*');
    const transfer = { ...result[0] };
    const transaction = [{
      description: `transfer from conta#${transfer.acc_ori_id}`,
      type: 'O',
      date: transfer.data,
      amnount: transfer.ammount * -1,
      acc_id: transfer.acc_ori_id,
      transfer_id: transfer.id,
    }, {
      description: `transfer to conta#${transfer.acc_dest_id}`,
      type: 'I',
      date: transfer.data,
      amnount: transfer.ammount,
      acc_id: transfer.acc_dest_id,
      transfer_id: transfer.id,
    }];

    await app.db('transactions').insert(transaction);

    return result;
  };

  const update = async (id, transferencia) => {
    const updated = await app.db('transfers').where({ id }).update(transferencia, '*');

    const transfer = { ...updated[0] };

    const transaction = [{
      description: `transfer from conta#${transfer.acc_ori_id}`,
      type: 'O',
      date: transfer.data,
      amnount: transfer.ammount * -1,
      acc_id: transfer.acc_ori_id,
      transfer_id: transfer.id,
    }, {
      description: `transfer to conta#${transfer.acc_dest_id}`,
      type: 'I',
      date: transfer.data,
      amnount: transfer.ammount,
      acc_id: transfer.acc_dest_id,
      transfer_id: transfer.id,
    }];

    await app.db('transactions').insert({ transfer_id: transfer.id }).del();
    await app.db('transactions').insert(transaction);

    return updated;
  };
  return { find, save, findOne, update };
};
