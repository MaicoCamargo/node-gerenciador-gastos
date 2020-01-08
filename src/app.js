const app = require('express')();
const consign = require('consign');

consign({ cwd: 'src', verbose: false }).include('./config/middleware.js').into(app);

app.get('/', (req, res) => {
  res.status(200).send();
});

app.get('/users', (req, res) => {
  const users = [{ nome: 'Maico Camargo' }];
  res.status(200).send(users);
});

app.post('/users', (req, res) => {
  res.status(201).send(req.body);
});

module.exports = app;
