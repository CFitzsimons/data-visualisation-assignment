import type { Knex } from 'knex';

export async function up (knex: Knex): Promise<void> {
  return knex.schema
    .createTable('Tag', table => {
      table.increments('id').primary().unique();
      table.string('name').unique().notNullable();
    })
    .createTable('Genre', table => {
      table.increments('id').primary().unique();
      table.string('name').unique().notNullable();
    })
    .createTable('Category', table => {
      table.increments('id').primary().unique();
      table.string('name').unique().notNullable();
    })
    .createTable('Game', table => {
      table.string('id').primary().unique(); // App ID
      table.string('name').notNullable();
    })
    .createTable('GameTag', table => {
      table.string('gameID').references('Game.id');
      table.integer('tagID').references('Tag.id');
      table.unique(['gameID', 'tagID']);
      table.index('gameID');
      table.index('tagID');
    })
    .createTable('GameCategory', table => {
      table.string('gameID').references('Game.id');
      table.integer('categoryID').references('Category.id');
      table.unique(['gameID', 'categoryID']);
      table.index('gameID');
      table.index('categoryID');
    })
    .createTable('GameGenre', table => {
      table.string('gameID').references('Game.id');
      table.integer('genreID').references('Genre.id');
      table.unique(['gameID', 'genreID']);
      table.index('gameID');
      table.index('genreID');
    });
}

export async function down (knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('GameTag')
    .dropTableIfExists('GameCategory')
    .dropTableIfExists('GameGenre')
    .dropTableIfExists('Game')
    .dropTableIfExists('Category')
    .dropTableIfExists('Genre')
    .dropTableIfExists('Tag');

}
