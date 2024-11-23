import knex from 'knex';
import knexConifg from '../knexfile';

const knexInstance = knex(knexConifg.development);

export default knexInstance;