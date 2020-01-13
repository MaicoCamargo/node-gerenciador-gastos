const request = require('supertest');
const app = require('../../src/app');

let user;
const ROTA_ACCOUNT = '/account';

beforeAll(async () => {
  const result = await app.services.user.save({ nome: 'User acc', mail: `testeACC${Date.now()}@mail.com`, passwd: '1234' });
  user = { ...result[0] };
});

test('Criar conta com sucesso', async () => {
  const response = await request(app).post(ROTA_ACCOUNT).send({ name: 'acc #1 (teste)', user_id: user.id });
  expect(response.status).toBe(201);
  // expect();
});
