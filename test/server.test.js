// TODO pegar as informações de um arquivo .env
const supertest = require('supertest');

const request = supertest('http://127.0.0.1:3001');
/* supertest lib para fazer requisicoes */
test('servidor rodando na porta 3001', () => request.get('/').then((response) => { expect(response.status).toBe(200); }));
