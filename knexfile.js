// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: 'pg',
    connection: {
      database: 'SteamAnalysis',
      user: 'username',
      password: 'password'
    },
    migrations: {
      tableName: 'migrations'
    }
  },

};
