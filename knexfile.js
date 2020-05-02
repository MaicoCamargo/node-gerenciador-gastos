module.exports = {
  test: {
    client: 'postgres',
    version: '10',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'Portella08',
      database: 'gestor-gastos-db',
    },
    migrations: { directory: 'src/migrations' },
    seeds: { directory: 'src/seeds' },

  },
};
