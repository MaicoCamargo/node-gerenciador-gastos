const request = require('supertest');
const app = require('../../src/app');

const AUTH_ROUTE = '/auth';
const SIGNIN_ROUTE = `${AUTH_ROUTE}/signin`;
const SIGNUP_ROUTE = `${AUTH_ROUTE}/signup`;
const MAIN_ROUTE = '/api';
const USER_ROUTE = `${MAIN_ROUTE}/user`;


test('deve criar usuário via signup', async () => {
  const usuario = { nome: 'Mai', mail: `criandousuario_${Date.now()}@mail.com`, passwd: '123456' };
  const response = await request(app).post(SIGNUP_ROUTE).send(usuario);
  expect(response.status).toBe(201);
  expect(response.body.nome).toEqual(usuario.nome);
  expect(response.body).toHaveProperty('mail');
  expect(response.body).not.toHaveProperty('passwd');
});

test('Deve retornar token ao logar com sucesso', async () => {
  const mail = `teste_autenticar_${Date.now()}_@mail.com`;
  const passwd = '123456';
  // criando usuario
  const usuario = await app.services.user.save({ nome: 'autenti', mail, passwd });
  expect(usuario.id).not.toBeNull();
  // tentar logar usuario
  const response = await request(app).post(SIGNIN_ROUTE).send({ mail, passwd });
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('token');
});

test('Não Deve logar com usuário ou senha incorretos', async () => {
  const mail = `teste_autenticar_${Date.now()}_@mail.com`;
  const passwd = '123456';
  // criando usuario
  const usuario = await app.services.user.save({ nome: 'autenti', mail, passwd });
  expect(usuario.id).not.toBeNull();
  // tentar logar usuario
  const response = await request(app).post(SIGNIN_ROUTE).send({ mail, passwd: 'minhasenha' });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Login Invalido');
});

test('Não Deve logar com usuário que não existe', async () => {
  const mail = 'naoexite@mail.com';
  const passwd = '123456';
  // tentar logar usuario
  const response = await request(app).post(SIGNIN_ROUTE).send({ mail, passwd });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Login Invalido');
});

test('Não deve acessar uma rota protegida sem token',async () => {
  const response = await request(app).get(USER_ROUTE);
  expect(response.status).toBe(401);
});
