test('conhecendo o jest: conceitos basicos', () => {
  let number = null;
  expect(number).toBeNull();// valida se o valor é null
  number = 10;
  expect(number).not.toBeNull(); // valida se n~ao é null

  expect(number).toBeGreaterThan(3); // valida se valor maior que
  expect(number).toBeLessThan(11); // valida se valor menor que
  expect(number).toBe(10);// valida igualdade
  expect(number).toEqual(10); // valida igualdade
});

test('como trabalhar com objetos', () => {
  const obj = { nome: 'maico', idade: '23' };
  expect(obj).toHaveProperty('nome'); // saber se o objeto tem essa propriedade
  expect(obj).toHaveProperty('nome', 'maico'); // saber se o objeto tem essa propriedade - e valor

  expect(obj.nome).toBe('maico'); // validar VALOR o atributo do objeto direto

  /* DIFERENCA ENTRE tobe e toequal
    - para comparar objetos usar toequal
  */
});
