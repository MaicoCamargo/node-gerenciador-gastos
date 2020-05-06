const request = require('supertest');
const moment = require('moment');
const app = require('../../src/app');

const AUTH_ROUTE = '/auth/signin';
const MAIN_ROUTE = '/api';
const TRANSACTION_ROUTE = `${MAIN_ROUTE}/transaction`;
const BALANCE_ROUTE = `${MAIN_ROUTE}/balance`;
const TRANSFER_ROUTE = `${MAIN_ROUTE}/transfer`;
let TOKEN;

// credenciais usadas no seed
const mail = 'user_balanco_1@email.com';
const passwd = '123456';
let user;
let contaOrigem;
let contaDestino;

beforeAll(async () => {
  // exetar seed
  await app.db.seed.run();

  // logando com um usuario criado no seed
  const response = await request(app).post(AUTH_ROUTE).send({ mail, passwd });
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('token');
  TOKEN = response.body.token;
  const result = await app.db('user').where({ mail });
  user = { ...result[0] };
  [contaOrigem, contaDestino] = await app.db('account').where({ user_id: user.id });
});

describe('Ao calcular saldo do usuário', () => {
  const templateNovaTransacao = async (newData) => {
    const transacao = {
      description: 'transação test',
      date: new Date(),
      amnount: 100,
      type: 'I',
      acc_id: contaOrigem.id,
      status: true,
      ...newData,
    };
    return request(app).post(TRANSACTION_ROUTE).set('authorization', `bearer ${TOKEN}`).send(transacao);
  };

  test('Deve retorna as contas que possuem transações', async () => {
    const response = await request(app).get(BALANCE_ROUTE).set('authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  test('Deve adicionar valores de entrada', async () => {
    const resNovaTransacao = await templateNovaTransacao();
    expect(resNovaTransacao.status).toBe(201);

    const response = await request(app).get(BALANCE_ROUTE).set('authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].sum).toBe('100.00');
    expect(response.body[0].id).toBe(contaOrigem.id);
  });

  test('Deve subtrair valores de saida', async () => {
    const resNovaTransacao = await templateNovaTransacao({ type: 'O', amnount: 200 });
    expect(resNovaTransacao.status).toBe(201);

    const response = await request(app).get(BALANCE_ROUTE).set('authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].sum).toBe('-100.00');
    expect(response.body[0].id).toBe(contaOrigem.id);
  });

  test('Não deve considerar transações pendentes', async () => {
    const resNovaTransacao = await templateNovaTransacao({ type: 'O', amnount: 200, status: false });
    expect(resNovaTransacao.status).toBe(201);

    const response = await request(app).get(BALANCE_ROUTE).set('authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].sum).toBe('-100.00');
    expect(response.body[0].id).toBe(contaOrigem.id);
  });

  test('Não deve considerar saldo de contas distintas', async () => {
    const resNovaTransacao = await templateNovaTransacao({ amnount: 500, acc_id: contaDestino.id });
    expect(resNovaTransacao.status).toBe(201);

    const response = await request(app).get(BALANCE_ROUTE).set('authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].sum).toBe('-100.00');
    expect(response.body[0].id).toBe(contaOrigem.id);

    expect(response.body[1].sum).toBe('500.00');
    expect(response.body[1].id).toBe(contaDestino.id);
  });

  test('Não deve considerar contas de outro usuário', async () => {
    const contaDeOutroUsuario = await app.db('account').where('user_id', '!=', user.id).first();
    const resNovaTransacao = await templateNovaTransacao(
      {
        acc_id: contaDeOutroUsuario.id,
        amnount: 4.5,
      },
    );
    expect(resNovaTransacao.status).toBe(201);

    const response = await request(app).get(BALANCE_ROUTE).set('authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].sum).toBe('-100.00');
    expect(response.body[0].id).toBe(contaOrigem.id);

    expect(response.body[1].sum).toBe('500.00');
    expect(response.body[1].id).toBe(contaDestino.id);
  });

  test('Não deve considerar transação passada', async () => {
    const resNovaTransacao = await templateNovaTransacao(
      {
        date: moment().subtract({ days: 5 }),
        amnount: 200,
        type: 'O',
      },
    );
    expect(resNovaTransacao.status).toBe(201);

    const response = await request(app).get(BALANCE_ROUTE).set('authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].sum).toBe('-300.00');
    expect(response.body[0].id).toBe(contaOrigem.id);

    expect(response.body[1].sum).toBe('500.00');
    expect(response.body[1].id).toBe(contaDestino.id);
  });

  test('Não deve considerar transação futura', async () => {
    const resNovaTransacao = await templateNovaTransacao(
      {
        date: moment().add({ days: 5 }),
        amnount: 200,
        type: 'O',
      },
    );
    expect(resNovaTransacao.status).toBe(201);

    const response = await request(app).get(BALANCE_ROUTE).set('authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].sum).toBe('-300.00');
    expect(response.body[0].id).toBe(contaOrigem.id);

    expect(response.body[1].sum).toBe('500.00');
    expect(response.body[1].id).toBe(contaDestino.id);
  });

  test('Deve considerar transferências', async () => {
    const transferencia = {
      description: 'nova transfer #balance',
      data: new Date(),
      ammount: 999,
      acc_ori_id: contaOrigem.id,
      acc_dest_id: contaDestino.id,
    };
    const reqNovaTrans = await request(app).post(TRANSFER_ROUTE).set('authorization', `bearer ${TOKEN}`).send(transferencia);
    expect(reqNovaTrans.status).toBe(201);

    const response = await request(app).get(BALANCE_ROUTE).set('authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0].sum).toBe('-300.00');
    expect(response.body[0].id).toBe(contaOrigem.id);

    expect(response.body[1].sum).toBe('500.00');
    expect(response.body[1].id).toBe(contaDestino.id);
  });
});
