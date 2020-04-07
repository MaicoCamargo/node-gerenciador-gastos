const request = require('supertest');
const app = require('../../src/app');


test('Deve retornar token ao logar com sucesso', async () => {
  const mail = `teste_autenticar_${Date.now()}_@mail.com`;
  const passwd = '123456';
  // criando usuario
  const usuario = await app.services.user.save({ nome: 'autenti', mail, passwd });
  expect(usuario.id).not.toBeNull();
  // tentar logar usuario
  const response = await request(app).post('/auth/signin').send({ mail, passwd });
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
  const response = await request(app).post('/auth/signin').send({ mail, passwd: 'minhasenha' });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Login Invalido');
});

test('Não Deve logar com usuário que não existe', async () => {
  const mail = 'naoexite@mail.com';
  const passwd = '123456';
  // tentar logar usuario
  const response = await request(app).post('/auth/signin').send({ mail, passwd });
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Login Invalido');
});
