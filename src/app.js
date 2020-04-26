const app = require('express')();
const consign = require('consign');
const knex = require('knex');
const knexFile = require('../knexfile');

// TODO deixar variavel dinamica
app.db = knex(knexFile.test);

consign({ cwd: 'src', verbose: false })
  .include('./config/passport.js')
  .then('./config/middleware.js')
  .then('./services')
  .then('./routes')
  .then('./config/router.js')
  .into(app);

app.get('/', (req, res) => {
  res.status(200).send();
});

app.use((err, req, res, next) => {
  const { name, message, stack } = err;
  if (name === 'Validation Error') {
    res.status(400).json({ error: err.message });
  } if (name === 'Recurso Indevido Error') {
    res.status(403).json({ error: err.message });
  } else {
    res.status(500).json({ name, message, stack });
  }
  next(err);
});

// TODO remover
// app.db
//   .on('query', (query) => {
//     console.log({ sql: query.sql, bindings: query.bindings ? query.bindings.join(',') : '' });
//   })
//   .on('query-response', (result) => {
//     console.log(result);
//   })
//   .on('error', (error) => {
//     console.log(error);
//   });

module.exports = app;
