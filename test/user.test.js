const request = require('supertest');
const app = require('../src/app');

test('deve listar todos usuarios', () => {
  return request(app).get('/users').then((response) => {
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('nome', 'Maico Camargo');
  });
});

test('deve criar um usuario com sucesso', () => {
  return request(app).post('/users').send({ nome: 'Eder Camargo' }).then((response) => {
    expect(response.status).toBe(201);
    expect(response.body.nome).toBe('Eder Camargo');
  });
});
