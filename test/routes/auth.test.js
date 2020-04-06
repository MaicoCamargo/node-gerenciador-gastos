const request = require('supertest');
const app = require('../../src/app');


test('Deve retornar token ao logar', async () => {
  const mail = `teste_autenticar_${Date.now()}_@mail.com`;
  const passwd = '123456';
  // criando usuario
  const usuario = app.services.user.save({ nome: 'autenti', mail, passwd });
  expect(usuario.id).not.toBeNull();
  // tentar logar usuario
  const response = await request(app).post('/auth/signin').send({ mail, passwd });
  expect(response).toHaveProperty('token');
  expect(response.status).toBe(200);
});
