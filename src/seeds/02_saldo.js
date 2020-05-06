
exports.seed = async (knex) => {
  return knex('user').insert([
    { nome: 'balance USER @1', mail: 'user_balanco_1@email.com', passwd: '$2a$10$88HpHwZQrDjfBDwWQ40PuuuNQ44SKfKS3qf60oQRIFOJMW4pt1H.a' },
    { nome: 'balance USER @2', mail: `user_balanco_2${Date.now()}`, passwd: '$2a$10$88HpHwZQrDjfBDwWQ40PuuuNQ44SKfKS3qf60oQRIFOJMW4pt1H.a' },
  ], '*')
    .then((result) => {
      const [user, user2] = result;
      return knex('account').insert([
        { user_id: user.id, name: 'conta balence #1 user 1' },
        { user_id: user.id, name: 'conta balence  #2 user 1' },
        { user_id: user2.id, name: 'alternativa balence  #3 user 2' },
        { user_id: user2.id, name: 'alternativa 2 balence  #4 user 2' },
      ]);
    });
};
