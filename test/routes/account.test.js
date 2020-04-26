const request = require('supertest');
const app = require('../../src/app');

let user;
const AUTH_ROUTE = '/auth/signin';
const MAIN_ROUTE = '/api';
const ROTA_ACCOUNT = `${MAIN_ROUTE}/account`;
let token;
let user2;

/* beforeAll -> executa antes de todos os testes
   beforeEach -> executa antes de cada um dos testes */
beforeEach(async () => {
  const mail = `testeACC${Date.now()}@mail.com`;
  const passwd = '1234';
  const result = await app.services.user.save({ nome: 'User acc', mail, passwd });
  user = { ...result[0] };
  const response = await request(app).post(AUTH_ROUTE).send({ mail, passwd });

  const resultInsert = await app.services.user.save({ nome: 'User #2', mail: `acc_${Date.now()}@email`, passwd: 'teste' });
  user2 = { ...resultInsert[0] };

  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('token');
  token = response.body.token;
});

test('Criar conta com sucesso', async () => {
  const response = await request(app).post(ROTA_ACCOUNT).send({ name: 'acc #1 (teste)' }).set('Authorization', `bearer ${token}`);
  expect(response.status).toBe(201);
  expect(response.body.name).toBe('acc #1 (teste)');
});

test('Não deve inserir uma conta sem nome', async () => {
  const response = await request(app).post(ROTA_ACCOUNT).send({ }).set('Authorization', `bearer ${token}`);
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Nome é um campo obrigatório');
});

test('Listar conta buscando pelo id', async () => {
  const result = await app.db('account').insert({ name: 'acc by id# (teste)', user_id: user.id }, '*');

  const response = await request(app).get(`${ROTA_ACCOUNT}/${result[0].id}`).set('Authorization', `bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body.name).toBe('acc by id# (teste)');
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

test('Deve listar contas do usuário logado', async () => {
  app.db('account').insert([
    { name: 'conta #1', user_id: user.id },
    { name: 'conta #1', user_id: user2.id },
  ]).then(async () => {
    const response = await request(app).get(ROTA_ACCOUNT).set('Authorization', `bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('conta #1');
  });
});

test.skip('Não deve listar contas de outro usuário', () => { });

test.skip('Não deve alterar contas de outro usuário', () => { });

test.skip('Não deve remover contas de outro usuário', () => { });

test('Não deve inserir uma conta com nome duplicado, para o mesmo usuario', async () => {
  await app.db('account').insert([{ name: 'conta #duplicada', user_id: user.id }]);
  const response = await request(app).post(ROTA_ACCOUNT).set('Authorization', `bearer ${token}`).send({ name: 'conta #duplicada' });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Já existe uma conta com este nome');
});
