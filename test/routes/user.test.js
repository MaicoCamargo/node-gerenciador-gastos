const request = require('supertest');
const app = require('../../src/app');

const mail = `teste_${Date.now()}_@mail.com`;

let token;

beforeAll(async () => {
  /*
  ----------------------------------------------
    -> exexuta antes de qualquer teste
  ----------------------------------------------
 */
  const passwd = '123456';
  const mailAuth = `auth${Date.now()}`;
  // criando usuario
  const usuario = await app.services.user.save({ nome: `token${Date.now()}`, mail: mailAuth, passwd });
  expect(usuario.id).not.toBeNull();
  // tentar logar usuario

  const response = await request(app).post('/auth/signin').send({ mail: mailAuth, passwd });
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('token');
  token = response.body.token;
});

test('Deve listar todos usuarios', () => {
  return request(app).get('/user').set('Authorization', `bearer ${token}`).then((response) => {
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).not.toHaveProperty('passwd');
  });
});

test('Deve criar um usuario com sucesso', () => {
  return request(app).post('/user').send({ nome: 'Eder Camargo', mail, passwd: '1234' }).set('Authorization', `bearer ${token}`)
    .then((response) => {
      expect(response.status).toBe(201);
      expect(response.body.nome).toBe('Eder Camargo');
      expect(response.body).not.toHaveProperty('passwd');
    });
});

/**
 * teste usando return
 */
test('Não deve criar um usuario sem nome', () => {
  return request(app).post('/user').send({ mail: 'test@email.com', passwd: '1234' }).set('Authorization', `bearer ${token}`)
    .then((response) => {
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Nome é um atributo obrigatório');
    });
});

/**
 * teste usando async await
 */
test('Não deve criar um usuario sem email', async () => {
  const result = await request(app).post('/user').send({ nome: 'ana pa', passwd: '1234' }).set('Authorization', `bearer ${token}`);
  expect(result.status).toBe(400);
  expect(result.body.error).toBe('Email é um atributo obrigatório');
});

/**
 * não esquecer de usar o done() no final da promisse
 * - caso der erro pegar no catch e usar done.fail() para sinal que o teste falhou
 */
test('Não deve criar um usuario sem senha', (done) => {
  request(app).post('/user').send({ nome: 'ana pa', mail: 'test@email.com' }).set('Authorization', `bearer ${token}`)
    .then((result) => {
      expect(result.status).toBe(400);
      expect(result.body.error).toBe('Senha é um atributo obrigatório');
      done();
    });
});

test('Não deve cadastrar usuario com email já inserido', async () => {
  const result = await request(app).post('/user').set('Authorization', `bearer ${token}`).send({ nome: 'Eder Camargo', mail, passwd: '1234' });
  expect(result.body.error).toBe('Já existe um usuario com esse email');
  expect(result.status).toBe(400);
});

test('Deve criar usuário com senha criptografada', async () => {
  const passwd = '123456';
  const response = await request(app).post('/user')
    .set('Authorization', `bearer ${token}`)
    .send({ nome: 'Eder Camargo - crip', mail: `crip${Date.now()}`, passwd });
  const { id } = response.body;
  const senhaCript = await app.services.user.findOne({ id });
  expect(response.status).toBe(201);
  expect(senhaCript).not.toBeUndefined();
  expect(senhaCript.passwd).not.toBe(passwd);
});
