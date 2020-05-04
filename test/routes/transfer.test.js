const request = require('supertest');
const app = require('../../src/app');

const AUTH_ROUTE = '/auth/signin';
const MAIN_ROUTE = '/api';
const TRANSFER_ROUTE = `${MAIN_ROUTE}/transfer`;
let TOKEN;

// credenciais usadas no seed
const mail = 'seed_1@email';
const passwd = '123456';

beforeAll(async () => {
  // exetar seed
  await app.db.seed.run();
  // logando com um usuario criado no seed
  const response = await request(app).post(AUTH_ROUTE).send({ mail, passwd });
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('token');
  TOKEN = response.body.token;
});

describe('Listar Transações', () => {
  test('Deve listar apenas transferencias do usuário logado', async () => {
    const response = await request(app).get(TRANSFER_ROUTE).set('Authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].description).toBe('transfer @1');
  });
});

describe('Criar Transações', () => {
  test('Deve criar uma transação com sucesso', async () => {
    const user = await app.db('user').where({ mail });
    const contas = await app.db('account').where({ user_id: user[0].id });
    const transfer = { description: 'nova transfer #', data: new Date(), ammount: 250, acc_ori_id: contas[0].id, acc_dest_id: contas[1].id, user_id: user.id };

    const response = await request(app).post(TRANSFER_ROUTE).set('Authorization', `bearer ${TOKEN}`).send(transfer);
    const transferCriada = { ...response.body };
    expect(response.status).toBe(201);
    expect(transferCriada.description).toBe('nova transfer #');

    // validar se as transações foram criadas
    const transactions = await app.db('transactions').where({ transfer_id: transferCriada.id });
    expect(transactions).toHaveLength(2);
    expect(transactions[0].description).toBe(`transfer from conta#${transferCriada.acc_ori_id}`);
    expect(transactions[0].amnount).toBe('-250.00');
    expect(transactions[1].amnount).toBe('250.00');
    expect(transactions[0].acc_id).toBe(contas[0].id);
    expect(transactions[1].acc_id).toBe(contas[1].id);
  });
});
