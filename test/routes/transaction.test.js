const request = require('supertest');
const app = require('../../src/app');

let user;
let user2;
let conta;
let conta2;
let token;
const AUTH_ROUTE = '/auth/signin';
const MAIN_ROUTE = '/api';
const ROTA_ACCOUNT = `${MAIN_ROUTE}/account`;
const USER_ACCOUNT = `${MAIN_ROUTE}/user`;
const TRANSACTION_ACCOUNT = `${MAIN_ROUTE}/transaction`;

beforeAll(async () => {
  /*-----------------------
  * deletar todos os registros de usuario conta e transações do banco
  * inserir dois dados nas tabelas usuario e conta
  * -----------------------
  * */

  // deletando registros do banco
  await app.db('transactions').del();
  await app.db('account').del();
  await app.db('user').del();

  // criando dois usuarios
  const mail = `teste_transaction${Date.now()}@mail.com`;
  const passwd = '_transaction';
  const result = await app.services.user.save({ nome: 'User tRa #1', mail, passwd });
  user = { ...result[0] };
  const response = await request(app).post(AUTH_ROUTE).send({ mail, passwd });

  const resultInsert = await app.services.user.save({ nome: 'User tRa #2', mail: `_transaction${Date.now()}@email`, passwd: '_transaction' });
  user2 = { ...resultInsert[0] };

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('token');
  token = response.body.token;

  // criando duas contas uma para cada usuario
  [conta, conta2] = await app.db('account')
    .insert([
      {
        name: `conta #1 user ${user.name} and id [${user.id}]`,
        user_id: user.id,
      },
      {
        name: `conta #2 user ${user2.name} and id [${user2.id}]`,
        user_id: user2.id,
      },
    ], '*');
});
