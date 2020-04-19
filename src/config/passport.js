const passport = require('passport');
const passportJwt = require('passport-jwt');

const { ExtractJwt, Strategy } = passportJwt;
// mesmo segredo do file routes/auth
const segredo = 'segredo';

module.exports = (app) => {
  const params = { secretOrKey: segredo, jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken() };

  const strategy = new Strategy(params, (payload, done) => {
    app.services.user.findOne({ id: payload.id }).then((result) => {
      if (result) done(null, { ...payload });
      else done(null, false);
    }).catch((error) => done(error, false));
  });

  passport.use(strategy);

  return { authenticate: () => passport.authenticate('jwt', { session: false }) };
};
