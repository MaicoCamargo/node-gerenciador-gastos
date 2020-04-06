module.exports = (app) => {
  app.route('/auth/signin')
    .post(app.routes.auth.signin);

  app.route('/users')
    .get(app.routes.users.findAll)
    .post(app.routes.users.create);

  app.route('/account')
    .get(app.routes.account.findAll)
    .post(app.routes.account.create);

  app.route('/account/:id')
    .get(app.routes.account.findById)
    .put(app.routes.account.update)
    .delete(app.routes.account.remove);
};
