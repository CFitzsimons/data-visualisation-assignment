import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('UnprocessedReviews', table => {
    table.string('id').unique();
    table.integer('gameID');
    table.text('review');
    table.boolean('positive');
    table.bigint('upvotes');
    table.bigint('funnyVotes');
    table.dateTime('created');
    table.dateTime('updated');
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('UnprocessedReviews');
}

