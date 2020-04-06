const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
// TODO add o segredi no arquivo .env
const segredo = 'segredo';

module.exports = (app) => {
  const signin = async (req, res, next) => {
    app.services.user.findOne({ mail: req.body.mail })
      .then((usuario) => {
        if (bcrypt.compareSync(req.body.passwd, usuario.passwd)) {
          const payload = {
            id: usuario.id,
            name: usuario.nome,
            mail: usuario.mail,
          };
          const token = jwt.encode(payload, segredo);
          res.status(200)
            .json({ token });
        }
      })
      .catch((error) => next(error));
  };

  return { signin };
};
