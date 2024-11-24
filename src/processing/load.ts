import knex from './knex';


type ListData = { name: string }[];
type GameData = { name: string; id: number; }[];

import categories from '../../output/categories.json';
import genres from '../../output/genres.json';
import tags from '../../output/tags.json';
import games from '../../output/games.json';

const loadList = async (data: ListData, tableName: string) => {
  await knex(tableName)
    .insert(data)
    .onConflict('name')
    .ignore();
};

const loadGames = async (data: GameData) => {
  const CHUNK_SIZE = 100;
  let marker = -CHUNK_SIZE;
  do {
    marker = marker + CHUNK_SIZE;
    const current = data.slice(marker, marker + CHUNK_SIZE);
    if (current.length === 0) {
      break;
    }
    await knex('Game')
      .insert(current)
      .onConflict(['id'])
      .ignore();
  } while (marker < data.length);
};

(async () => {
  await loadList(categories, 'Category');
  await loadList(genres, 'Genre');
  await loadList(tags, 'Tag');
  await loadGames(games as GameData);
  process.exit(1);
})();