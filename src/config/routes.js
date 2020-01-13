module.exports = (app) => {
  app.route('/users')
    .get(app.routes.users.findAll)
    .post(app.routes.users.create);

  app.route('/account')
    .get(app.routes.account.findAll)
    .post(app.routes.account.create);
};
