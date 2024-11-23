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
      table.string('name').unique().notNullable();
    })
    .createTable('GameTag', table => {
      table.string('gameID').references('Game.id');
      table.integer('tagID').references('Tag.id');
      table.unique(['gameID', 'tagID']);
    });
}

export async function down (knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('GameTag')
    .dropTableIfExists('Game')
    .dropTableIfExists('Category')
    .dropTableIfExists('Genre')
    .dropTableIfExists('Tag');
}
