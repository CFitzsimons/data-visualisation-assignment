import type { Knex } from 'knex';

export async function up (knex: Knex): Promise<void> {
  return knex.schema
    .createTable('Sentiment', table => {
      table.increments('id').unique();
      table.string('name');
    })
    .createTable('Review', table => {
      table.string('id').unique();
      table.string('gameID').references('Game.id');
      table.integer('sentimentID').references('Sentiment.id');
      table.text('review');
      table.boolean('positive');
      table.bigint('upvotes');
      table.bigint('funnyVotes');
      table.dateTime('created');
      table.dateTime('updated');
      table.index('id');
      table.index('gameID');
      table.index('sentimentID');
    });
}

export async function down (knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('Review')
    .dropTableIfExists('Sentiment');
}
