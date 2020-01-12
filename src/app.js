const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexFile = require('../knexfile');

// TODO deixar variavel dinamica
app.db = knex(knexFile.test);

consign({ cwd: 'src', verbose: false }).include('./config/middleware.js').then('./routes').then('./config/routes.js')
  .into(app);

app.get('/', (req, res) => {
  res.status(200).send();
});

// TODO remover
app.db
  .on('query', (query) => {
    console.log({ sql: query.sql, bindings: query.bindings ? query.bindings.join(',') : '' });
  })
  .on('query-response', (result) => {
    console.log(result);
  })
  .on('error', (error) => {
    console.log(error);
  });

module.exports = app;
