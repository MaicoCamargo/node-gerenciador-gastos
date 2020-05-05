const request = require('supertest');
const app = require('../../src/app');

const AUTH_ROUTE = '/auth/signin';
const MAIN_ROUTE = '/api';
const TRANSFER_ROUTE = `${MAIN_ROUTE}/transfer`;
let TOKEN;

// credenciais usadas no seed
const mail = 'seed_1@email';
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
  user = await app.db('user').where({ mail });
  [contaOrigem, contaDestino] = await app.db('account').where({ user_id: user[0].id });
});

describe('Listar Transferências', () => {
  test('Deve listar apenas transferências do usuário logado', async () => {
    const response = await request(app).get(TRANSFER_ROUTE).set('Authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].description).toBe('transfer @1');
  });

  test('Deve listar uma transferência pelo ID', async () => {
    const transferencias = await app.db('transfers');
    const response = await request(app).get(`${TRANSFER_ROUTE}/${transferencias[0].id}`).set('Authorization', `bearer ${TOKEN}`);
    expect(response.status).toBe(200);
    expect(response.body.description).toBe(transferencias[0].description);
  });
});

describe('Ao criar Transferências validas...', () => {
  let transferenciaCriada;
  let transactionSaida;
  let transactionEntrada;

  test('Deve criar uma transferência com sucesso, e criar suas transações', async () => {
    const novaTransferencia = { description: 'nova transfer #', data: new Date(), ammount: 250, acc_ori_id: contaOrigem.id, acc_dest_id: contaDestino.id, user_id: user[0].id };

    const response = await request(app).post(TRANSFER_ROUTE).set('Authorization', `bearer ${TOKEN}`).send(novaTransferencia);
    transferenciaCriada = { ...response.body };
    expect(response.status).toBe(201);
    expect(transferenciaCriada.description).toBe('nova transfer #');

    // validar se as transações foram criadas
    const transactions = await app.db('transactions').where({ transfer_id: transferenciaCriada.id }).orderBy('amnount');
    expect(transactions).toHaveLength(2);
    expect(transactions[0].description).toBe(`transfer from conta#${transferenciaCriada.acc_ori_id}`);
    expect(transactions[0].amnount).toBe('-250.00');
    expect(transactions[1].amnount).toBe('250.00');
    expect(transactions[0].acc_id).toBe(contaOrigem.id);
    expect(transactions[1].acc_id).toBe(contaDestino.id);

    [transactionSaida, transactionEntrada] = transactions;
  });

  test('A transação de saida deve ser negativa', () => {
    expect(transactionSaida.type).toBe('O');
    // TODO remover esse valor chumbado da transferencia criada
    expect(transactionSaida.amnount).toBe('-250.00');
  });

  test('A transação de entrada deve ser positiva', () => {
    expect(transactionEntrada.type).toBe('I');
    expect(transactionEntrada.amnount).toBe(transferenciaCriada.ammount);
  });

  test('Transacões criadas devem estar associadas há transferência criada', () => {
    expect(transactionSaida.transfer_id).toBe(transferenciaCriada.id);
    expect(transactionEntrada.transfer_id).toBe(transferenciaCriada.id);
  });
});

describe('Ao criar Transferências invalidas...', () => {
  const createTransferenciaTeste = async (newData) => {
    return request(app).post(TRANSFER_ROUTE)
      .set('Authorization', `bearer ${TOKEN}`)
      .send({
        description: 'nova transfer #',
        data: new Date(),
        ammount: 250,
        acc_ori_id: contaOrigem.id,
        acc_dest_id: contaDestino.id,
        user_id: user[0].id,
        ...newData,
      });
  };
  test('Sem descrição', async () => {
    const response = await createTransferenciaTeste({ description: null });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Descrição é um campo obrigatório');
  });

  test('Sem data', async () => {
    const response = await createTransferenciaTeste({ data: null });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Data é um campo obrigatório');
  });

  test('Sem valor', async () => {
    const response = await createTransferenciaTeste({ ammount: null });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Valor é um campo obrigatório');
  });

  test('Sem conta de origem', async () => {
    const response = await createTransferenciaTeste({ acc_ori_id: null });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Conta é um campo obrigatório');
  });

  test('Sem conta de destino', async () => {
    const response = await createTransferenciaTeste({ acc_dest_id: null });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Conta é um campo obrigatório');
  });

  test('Conta de origem e destino iguais', async () => {
    const response = await createTransferenciaTeste({ acc_dest_id: contaOrigem.id });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Conta origem e destino não podem ser iguais');
  });

  test('Contas que Pertencem a outro usuário', async () => {
    const contaDeOutroUsuario = await app.db('account').where('user_id', '!=', user[0].id).first();
    const response = await createTransferenciaTeste({ acc_ori_id: contaDeOutroUsuario.id });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Uma ou ambas contas não pertencem a este usuário');
  });
});

describe('Ao alterar Transferências validas...', () => {
  let transferenciaEditada;
  let transactionSaida;
  let transactionEntrada;

  test('Deve alterar uma transferência com sucesso, e criar suas transações', async () => {
    const transferencias = await app.db('transfers');
    const transferencia = { description: 'transfer updated #', data: new Date(), ammount: 300, acc_ori_id: contaOrigem.id, acc_dest_id: contaDestino.id, user_id: user[0].id };

    const response = await request(app).put(`${TRANSFER_ROUTE}/${transferencias[0].id}`).set('Authorization', `bearer ${TOKEN}`).send(transferencia);
    transferenciaEditada = { ...response.body };

    expect(response.status).toBe(200);
    expect(transferenciaEditada.description).toBe('transfer updated #');

    // validar se as transações foram editadas
    const transactions = await app.db('transactions').where({ transfer_id: transferenciaEditada.id }).orderBy('amnount');
    expect(transactions).toHaveLength(2);
    expect(transactions[0].description).toBe(`transfer from conta#${transferenciaEditada.acc_ori_id}`);
    expect(transactions[0].amnount).toBe('-300.00');
    expect(transactions[1].amnount).toBe('300.00');
    expect(transactions[0].acc_id).toBe(contaOrigem.id);
    expect(transactions[1].acc_id).toBe(contaDestino.id);

    [transactionSaida, transactionEntrada] = transactions;
  });

  test('A transação de saida deve ser negativa', () => {
    expect(transactionSaida.type).toBe('O');
    // TODO remover esse valor chumbado da transferencia criada
    expect(transactionSaida.amnount).toBe('-300.00');
  });

  test('A transação de entrada deve ser positiva', () => {
    expect(transactionEntrada.type).toBe('I');
    expect(transactionEntrada.amnount).toBe(transferenciaEditada.ammount);
  });

  test('Transacões criadas devem estar associadas há transferência criada', () => {
    expect(transactionSaida.transfer_id).toBe(transferenciaEditada.id);
    expect(transactionEntrada.transfer_id).toBe(transferenciaEditada.id);
  });
});

describe('Ao alterar Transferências invalidas...', () => {
  const createTransferenciaTeste = async (newData) => {
    const transferencias = await app.db('transfers');

    return request(app).put(`${TRANSFER_ROUTE}/${transferencias[0].id}`)
      .set('Authorization', `bearer ${TOKEN}`)
      .send({
        description: 'nova transfer #',
        data: new Date(),
        ammount: 250,
        acc_ori_id: contaOrigem.id,
        acc_dest_id: contaDestino.id,
        user_id: user.id,
        ...newData,
      });
  };
  test('Sem descrição', async () => {
    const response = await createTransferenciaTeste({ description: null });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Descrição é um campo obrigatório');
  });

  test('Sem data', async () => {
    const response = await createTransferenciaTeste({ data: null });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Data é um campo obrigatório');
  });

  test('Sem valor', async () => {
    const response = await createTransferenciaTeste({ ammount: null });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Valor é um campo obrigatório');
  });

  test('Sem conta de origem', async () => {
    const response = await createTransferenciaTeste({ acc_ori_id: null });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Conta é um campo obrigatório');
  });

  test('Sem conta de destino', async () => {
    const response = await createTransferenciaTeste({ acc_dest_id: null });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Conta é um campo obrigatório');
  });

  test('Conta de origem e destino iguais', async () => {
    const response = await createTransferenciaTeste({ acc_dest_id: contaOrigem.id });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Conta origem e destino não podem ser iguais');
  });

  test('Contas que Pertencem a outro usuário', async () => {
    const contaDeOutroUsuario = await app.db('account').where('user_id', '!=', user[0].id).first();
    const response = await createTransferenciaTeste({ acc_ori_id: contaDeOutroUsuario.id });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Uma ou ambas contas não pertencem a este usuário');
  });
});
