import 'dotenv/config';
import { Knex } from 'knex';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    // ssl: {
    //   rejectUnauthorized: false, // Allow self-signed certificates (common with managed services)
    // },
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
