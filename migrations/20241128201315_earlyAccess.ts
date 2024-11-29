import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.table('Review', table => {
    table.boolean('earlyAccess').defaultTo(false);
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.table('Review', table => {
    table.dropColumn('earlyAccess');
  });
}

