import type { Knex } from 'knex';

export async function up (knex: Knex): Promise<void> {
  return knex.schema
    .createTable('Sentiment', table => {
      table.increments('id').unique();
      table.string('name');
    })
    .createTable('Review', table => {
      table.increments('id').unique();
      table.integer('gameID').references('Game.id');
      table.integer('sentimentID').references('Sentiment.id');
      table.text('review');
      table.boolean('positive');
      table.integer('upvotes');
      table.integer('funnyVotes');
      table.dateTime('created');
      table.dateTime('updated');
    });
}

export async function down (knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('Review')
    .dropTableIfExists('Sentiment')
    .dropTableIfExists('Category')
    .dropTableIfExists('Genre')
    .dropTableIfExists('Tag');
}
