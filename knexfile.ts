import 'dotenv/config';
import { Knex } from 'knex';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT ?? '5432', 10)
  },
  migrations: {
    tableName: 'migrations',
    extension: 'ts'
  }
};

const environmentConfiguration = {
  development: config
};

export default environmentConfiguration;
