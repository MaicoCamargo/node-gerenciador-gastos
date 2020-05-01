const request = require('supertest');
const app = require('../../src/app');

let user;
let user2;
let conta;
let conta2;
let token;
const AUTH_ROUTE = '/auth/signin';
const MAIN_ROUTE = '/api';
const TRANSACTION_ACCOUNT = `${MAIN_ROUTE}/transaction`;
const ROTA_ACCOUNT = `${MAIN_ROUTE}/account`;

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
    .insert(
      [
        { name: `conta #1 user ${user.name} and id [${user.id}]`, user_id: user.id },
        { name: `conta #2 user ${user2.name} and id [${user2.id}]`, user_id: user2.id },
      ],
      '*',
    );
});

describe('Ao tentar inserir uma transação invalida', async () => {
  // type: 'I' => entrada/deposito
  // type: 'O' => saida/saque
  const templateTestes = async (arg, error) => {
    const response = await request(app).post(TRANSACTION_ACCOUNT)
      .set('Authorization', `bearer ${token}`)
      .send({ description: 'transação test', date: new Date(), amnount: 22, type: 'I', acc_id: conta.id, ...arg });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(error);
  };

  test('Não deve inserir uma transação sem valor', () => templateTestes({ amnount: null }, 'valor é um campo obrigatório'));
  test('Não deve inserir uma transação sem data', () => templateTestes({ date: null }, 'data é um campo obrigatório'));
  test('Não deve inserir uma transação sem tipo', () => templateTestes({ type: null }, 'tipo é um campo obrigatório'));
  test('Não deve inserir uma transação sem desccrição', () => templateTestes({ description: null }, 'descrição é um campo obrigatório'));
  test('Não deve inserir uma transação com tipo invalido', async () => templateTestes({ type: 'M' }, 'tipo invalido'));
});

test('Deve lista apenas a transações do usuário logado', async () => {
  await app.db('transactions').insert([
    { description: 'conta 1 descr', type: 'I', date: new Date(), amnount: 205.56, acc_id: conta.id },
    { description: 'conta 2 descr', type: 'O', date: new Date(), amnount: 125.56, acc_id: conta2.id },
  ]);
  const response = await request(app).get(TRANSACTION_ACCOUNT).set('Authorization', `bearer ${token}`);
  expect(response.status).toBe(200);
  expect(response.body).toHaveLength(1);
  expect(response.body[0].description).toBe('conta 1 descr');
});

test('Deve criar uma transação com sucesso', async () => {
  // type: 'I' => entrada/deposito
  // type: 'O' => saida/saque
  const response = await request(app).post(TRANSACTION_ACCOUNT)
    .set('Authorization', `bearer ${token}`)
    .send({ description: 'new tra post test', date: new Date(), amnount: 22, type: 'I', acc_id: conta.id });
  expect(response.status).toBe(201);
  expect(response.body.acc_id).toBe(conta.id);
  expect(response.body.amnount).toBe('22.00');
});

test('Transações de entrada devem ser positivas', async () => {
  // type: 'I' => entrada/deposito
  // type: 'O' => saida/saque
  const response = await request(app).post(TRANSACTION_ACCOUNT)
    .set('Authorization', `bearer ${token}`)
    .send({ description: 'new tra entrada test', date: new Date(), amnount: -38, type: 'I', acc_id: conta.id });
  expect(response.status).toBe(201);
  expect(response.body.acc_id).toBe(conta.id);
  expect(response.body.amnount).toBe('38.00');
});

test('Transações de saida devem ser negativas', async () => {
  // type: 'I' => entrada/deposito
  // type: 'O' => saida/saque
  const response = await request(app).post(TRANSACTION_ACCOUNT)
    .set('Authorization', `bearer ${token}`)
    .send({ description: 'new tra saida test', date: new Date(), amnount: 150, type: 'O', acc_id: conta.id });
  expect(response.status).toBe(201);
  expect(response.body.acc_id).toBe(conta.id);
  expect(response.body.amnount).toBe('-150.00');
});

test('Deve retornar uma transação por ID', async () => {
  // criando nova transação
  const novaTransacao = await request(app)
    .post(TRANSACTION_ACCOUNT)
    .set('Authorization', `bearer ${token}`)
    .send({
      description: 'transação get id',
      date: new Date(),
      amnount: 985,
      type: 'O',
      acc_id: conta.id,
    });
  expect(novaTransacao.status).toBe(201);

  // buscar a transação criada
  const response = await request(app).get(`${TRANSACTION_ACCOUNT}/${novaTransacao.body.id}`)
    .set('Authorization', `bearer ${token}`);
  expect(response.status).toBe(200);
  expect(response.body.description).toBe('transação get id');
});

test('Devo editar uma transação', async () => {
  // cria uma nova transação
  const insert = await app.db('transactions').insert({
    description: 'transação # teste update',
    date: new Date(),
    amnount: 1,
    type: 'I',
    acc_id: conta.id,
  }, '*');
  const { id } = insert[0];
  expect(id).not.toBeNull();

  // tenta editar a transação
  const response = await request(app).put(`${TRANSACTION_ACCOUNT}/${id}`)
    .set('Authorization', `bearer ${token}`).send({
      description: 'upd@ transação',
      date: new Date(),
      amnount: 7.96,
      type: 'I',
      acc_id: conta.id,
    });

  const { description } = response.body;
  expect(response.status).toBe(200);
  expect(response.body.description).toBe(description);
  expect(response.body.id).toBe(id);
});

test('Deve remover uma transação de um usuário', async () => {
  // criando nova transação
  const transacao = await request(app)
    .post(TRANSACTION_ACCOUNT)
    .set('Authorization', `bearer ${token}`)
    .send({
      description: 'transação delete id',
      date: new Date(),
      amnount: 985,
      type: 'O',
      acc_id: conta.id,
    });
  expect(transacao.status).toBe(201);
  const { id } = transacao.body;
  const response = await request(app).delete(`${TRANSACTION_ACCOUNT}/${id}`)
    .set('Authorization', `bearer ${token}`);
  expect(response.status).toBe(204);

  const isDeleted = await app.db('transactions').where({ id });
  expect(isDeleted).toEqual([]);
  expect(isDeleted.length).toBe(0);
});

test('Não devo remover uma transação de outro usuário', async () => {
  // criando nova transação
  const transacao = await request(app)
    .post(TRANSACTION_ACCOUNT)
    .set('Authorization', `bearer ${token}`)
    .send({
      description: 'teste#',
      date: new Date(),
      amnount: 98,
      type: 'I',
      acc_id: conta2.id,
    });
  const { id } = transacao.body;

  // tentar removar a transação de outro usuário
  const response = await request(app)
    .delete(`${TRANSACTION_ACCOUNT}/${id}`)
    .set('Authorization', `bearer ${token}`);

  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Este recurso não pertence a este usuário');
});

test.skip('Não deve editar transação de outro usuário', async () => {});

test.skip('Não deve remover transação de outro usuário', async () => {});

test('Não deve remover conta que possuir transações', async () => {
  const response = await request(app).delete(`${ROTA_ACCOUNT}/${conta.id}`)
    .set('Authorization', `bearer ${token}`);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Essa conta possui transações');
});
