// node_modules/.bin/knex seed:make transfer --env test comando criar seed
exports.seed = (knex) => {
  // Deletes ALL existing entries
  let user;
  let user2;
  return knex('transactions').del()
    .then(() => knex('transfers').del())
    .then(() => knex('account').del())
    .then(() => knex('user').del())
    .then(() => knex('user').insert([
      { nome: 'seed *1', mail: `seed_1${Date.now()}`, passwd: '$2a$10$88HpHwZQrDjfBDwWQ40PuuuNQ44SKfKS3qf60oQRIFOJMW4pt1H.a' },
      { nome: 'seed *2', mail: `seed_2${Date.now()}`, passwd: '$2a$10$88HpHwZQrDjfBDwWQ40PuuuNQ44SKfKS3qf60oQRIFOJMW4pt1H.a' },
    ], '*'))
    .then((result) => {
      [user, user2] = result;
      return knex('account').insert([
        { user_id: user.id, name: 'seed acc #1 user 1' },
        { user_id: user.id, name: 'seed acc #2 user 1' },
        { user_id: user2.id, name: 'seed acc #3 user 2' },
        { user_id: user2.id, name: 'seed acc #4 user 2' },
      ], '*');
    })
    .then(async (result) => {
      const [conta1user1, conta2user1, conta3user2, conta4user2] = result;
      return knex('transfers').insert([
        { description: 'transfer @1', data: new Date(), ammount: 250, acc_ori_id: conta1user1.id, acc_dest_id: conta2user1.id, user_id: user.id },
        { description: 'transfer @2', data: new Date(), ammount: 150, acc_ori_id: conta3user2.id, acc_dest_id: conta4user2.id, user_id: user2.id },
      ], '*');
    })
    .then((result) => {
      const [transfer1, transfer2] = result;
      return knex('transactions')
        .insert([
          {
            description: 'transacao from conta1user1',
            date: new Date(),
            amnount: 250,
            acc_id: transfer1.acc_ori_id,
            type: 'I',
            transfer_id: transfer1.id,
          },
          {
            description: 'transacao to conta2user1',
            date: new Date(),
            amnount: -250,
            acc_id: transfer1.acc_dest_id,
            type: 'O',
            transfer_id: transfer1.id,
          },{
            description: 'transacao from conta3user2',
            date: new Date(),
            amnount: 150,
            acc_id: transfer2.acc_ori_id,
            type: 'I',
            transfer_id: transfer2.id,
          },
          {
            description: 'transacao to conta4user2',
            date: new Date(),
            amnount: -150,
            acc_id: transfer2.acc_dest_id,
            type: 'O',
            transfer_id: transfer2.id,
          },
        ]);
    });
};
