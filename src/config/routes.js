module.exports = (app) => {
  app.route('/auth/signin')
    .post(app.routes.auth.signin);

  app.route('/users')
    .all(app.config.passport.authenticate())
    .get(app.routes.users.findAll)
    .post(app.routes.users.create);

  app.route('/account')
    .all(app.config.passport.authenticate())
    .get(app.routes.account.findAll)
    .post(app.routes.account.create);

  app.route('/account/:id')
    .all(app.config.passport.authenticate())
    .get(app.routes.account.findById)
    .put(app.routes.account.update)
    .delete(app.routes.account.remove);
};
