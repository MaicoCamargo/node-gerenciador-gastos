
exports.up = (knex) => {
  return knex.schema.createTable('user', (table) => {
    table.increments('id').primary();
    table.string('nome').notNull();
    table.string('mail').notNull().unique();
    table.string('passwd').notNull();
  });
};

exports.down = (knex) => {
  return knex.schema.dropTable('user');
};
