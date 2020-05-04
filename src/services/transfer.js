
module.exports = (app) => {
  const find = (filter = {}) => {
    return app.db('transfers').where(filter).select();
  };

  const save = async (transferencia) => {
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
  return { find, save };
};
