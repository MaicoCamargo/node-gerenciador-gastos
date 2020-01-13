
exports.up = (knex) => {
  return knex.schema.createTable('account', (table) => {
    table.increments('id').primary();
    table.string('name').notNull();
    table.integer('user_id').references('id').inTable('user').notNull();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('account');
};
