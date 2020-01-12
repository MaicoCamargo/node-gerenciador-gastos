const request = require('supertest');
const app = require('../../src/app');

test('deve listar todos usuarios', () => {
  return request(app).get('/users').then((response) => {
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});

test('deve criar um usuario com sucesso', () => {
  const mail = `teste_${Date.now()}_@mail.com`;
  return request(app).post('/users').send({ nome: 'Eder Camargo', mail, passwd: '1234' }).then((response) => {
    expect(response.status).toBe(201);
    expect(response.body.nome).toBe('Eder Camargo');
  });
});
