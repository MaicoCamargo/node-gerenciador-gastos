const Bcrypt = require('bcrypt-nodejs');
const ValidationError = require('../errors/validationError');

module.exports = (app) => {
  /**
   * criar hash de uma string
   * @param passwd - string senha
   * @return {string} - senha criptograda
   */
  const setHash = (passwd) => {
    const salt = Bcrypt.genSaltSync(10); // add caracteres aleatórios na senha
    return Bcrypt.hashSync(passwd, salt);
  };
  const findOne = (filter = {}) => {
    // first() -> retorna apenas o primeiro resultado
    return app.db('user').where(filter).select(['nome', 'mail', 'id', 'passwd']).first();
  };
  const findAll = () => {
    return app.db('user').select(['nome', 'mail', 'id']);
  };

  const save = async (user) => {
    if (!user.nome) throw new ValidationError('Nome é um atributo obrigatório');
    if (!user.mail) throw new ValidationError('Email é um atributo obrigatório');
    if (!user.passwd) throw new ValidationError('Senha é um atributo obrigatório');

    const userPasswdHash = { ...user };
    userPasswdHash.passwd = setHash(user.passwd);

    const userDB = await findOne({ mail: user.mail });
    if (userDB) throw new ValidationError('Já existe um usuario com esse email');

    return app.db('user').insert(userPasswdHash, ['nome', 'mail', 'id']);
  };
  return { save, findAll, findOne };
};
