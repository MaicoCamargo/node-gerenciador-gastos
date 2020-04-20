const request = require('supertest');
const app = require('../../src/app');

let user;
const AUTH_ROUTE = '/auth/signin';
const MAIN_ROUTE = '/api';
const ROTA_ACCOUNT = `${MAIN_ROUTE}/account`;
let token;

beforeAll(async () => {
  const mail = `testeACC${Date.now()}@mail.com`;
  const passwd = '1234';
  const result = await app.services.user.save({ nome: 'User acc', mail, passwd });
  user = { ...result[0] };
  const response = await request(app).post(AUTH_ROUTE).send({ mail, passwd });
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('token');
  token = response.body.token;
});

test('Criar conta com sucesso', async () => {
  const response = await request(app).post(ROTA_ACCOUNT).send({ name: 'acc #1 (teste)', user_id: user.id }).set('Authorization', `bearer ${token}`);
  expect(response.status).toBe(201);
  expect(response.body.name).toBe('acc #1 (teste)');
});

test('Não deve inserir uma conta sem nome', async () => {
  const response = await request(app).post(ROTA_ACCOUNT).send({ user_id: user.id }).set('Authorization', `bearer ${token}`);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Nome é um campo obrigatório');
});

test('Listar todas as contas', async () => {
  /**
   * inserino uma conta para que um teste não dependa do outro
   *  - o teste anterior já insere uma conta
   */
  await request(app).post(ROTA_ACCOUNT).send({ name: 'acc #list (teste)', user_id: user.id }).set('Authorization', `bearer ${token}`);

  await request(app).get(ROTA_ACCOUNT).set('Authorization', `bearer ${token}`).then((response) => {
    expect(response.body.length).toBeGreaterThan(0);
  });
});

test('Listar conta buscando pelo id', async () => {
  const result = await app.db('account').insert({ name: 'acc # (teste)', user_id: user.id }, '*');

  const response = await request(app).get(`${ROTA_ACCOUNT}/${result[0].id}`).set('Authorization', `bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.name).toBe('acc # (teste)');
  expect(response.user_id).toBe(result.user_id);
});

test('Alterar conta com sucesso', async () => {
  const responseContaCriada = await request(app).post(ROTA_ACCOUNT).send({ name: 'acc update #', user_id: user.id }).set('Authorization', `bearer ${token}`);

  const response = await request(app).put(`${ROTA_ACCOUNT}/${responseContaCriada.body.id}`).send({ name: 'acc *updated*', user_id: user.id }).set('Authorization', `bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.name).toBe('acc *updated*');
  expect(response.body.id).toBe(responseContaCriada.body.id);
});

test('Excluir uma conta', async () => {
  const responseContaCriada = await request(app).post(ROTA_ACCOUNT).set('Authorization', `bearer ${token}`).send({ name: 'acc delete #', user_id: user.id });

  const response = await request(app).delete(`${ROTA_ACCOUNT}/${responseContaCriada.body.id}`).set('Authorization', `bearer ${token}`);
  expect(response.status).toBe(204);

  const isDeleted = await app.db('account').where({ id: responseContaCriada.body.id });

  expect(isDeleted).toEqual([]);
  expect(isDeleted.length).toBe(0);
});

test.skip('listar contas do usuário', () => {});

test.skip('Não deve listar contas de outro usuário', () => { });

test.skip('Não deve alterar contas de outro usuário', () => { });

test.skip('Não deve remover contas de outro usuário', () => { });

test.skip('Não deve inserir uma conta com nome duplicado', () => { });
