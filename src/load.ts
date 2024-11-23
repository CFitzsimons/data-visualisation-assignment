import knex from './knex';


type ListData = { name: string }[];

import categories from '../output/categories.json';
import genres from '../output/genres.json';
import tags from '../output/tags.json';

const loadList = async (data: ListData, tableName: string) => {
  await knex(tableName)
    .insert(data)
    .onConflict('name')
    .ignore();
};

(async () => {
  await loadList(categories, 'Category');
  await loadList(genres, 'Genre');
  await loadList(tags, 'Tag');
  process.exit(1);
})();