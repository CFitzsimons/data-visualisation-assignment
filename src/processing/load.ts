import * as v8 from 'v8';
import knex from './knex';
import fs from 'fs';

import { parse } from 'fast-csv';
type ListData = { name: string; [key: string]: unknown; }[];
type GameData = { name: string; id: number; }[];
type JoinData = { [key: string]: unknown; }[];

type GameReview = {
  id: string;
  gameID: string;
  review: string;
  updated: Date | null;
  created: Date | null;
  positive: boolean;
  upvotes: string;
  funnyVotes: string;
}

import categories from '../../output/categories.json';
import genres from '../../output/genres.json';
import tags from '../../output/tags.json';
import games from '../../output/games.json';
import gameCategories from '../../output/gameCategories.json';
import gameTags from '../../output/gameTags.json';
import gameGenres from '../../output/gameGenres.json';

const knownGames = games as GameData;
const knownGameIds = new Set(knownGames.map((game) => game.id.toString()));
console.log(`Heap Size Limit: ${v8.getHeapStatistics().heap_size_limit / 1024 / 1024} MB`);

const loadList = async (data: ListData | JoinData, tableName: string, chunkSize = 100, onConflict = ['name']) => {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    try {
      await knex(tableName)
        .insert(chunk)
        .onConflict(onConflict)
        .ignore();
      console.log(`Inserted chunk ${i / chunkSize + 1}/${Math.ceil(data.length / chunkSize)}`);
    } catch (error) {
      console.error(`Error inserting chunk ${i / chunkSize + 1}:`, error);
    }
  }
  console.log('All chunks loaded into', tableName);
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

const processResults = async (result: Review[]) => {
  if (result.length === 0) {
    return;
  }
  const mappedReviews: GameReview[] = result.map((item) => ({
    id: item.recommendationid.toString(),
    gameID: item.appid.toString(),
    review: item.review,
    updated: new Date(item.timestamp_created),
    created:  new Date(item.timestamp_updated),
    positive: item.voted_up === 1,
    upvotes: item.votes_up.toString(),
    funnyVotes: item.votes_funny.toString(),
  }))
  .filter((result) => !Number.isNaN(result.updated.getTime()) && !Number.isNaN(result.created.getTime()));
  const knownGameReviews = mappedReviews.filter((r) => knownGameIds.has(r.gameID));
  const unknownGameReviews = mappedReviews.filter((r) => !knownGameIds.has(r.gameID));
  const processData = async (tableName: string, dataset: GameReview[]) => {
    const CHUNK_SIZE_DB = 50; // Smaller DB chunk size for better memory handling
    for (let i = 0; i < dataset.length; i += CHUNK_SIZE_DB) {
      const chunkToInsert = dataset.slice(i, i + CHUNK_SIZE_DB);
      try {
        await knex(tableName)
        .insert(chunkToInsert)
        .onConflict(['id'])
        .ignore();
      } catch (err) {
        console.log(err);
        fs.writeFileSync('load-error.log', JSON.stringify(result, null, 2));
        process.exit(0);
      }
    }
  };
  await processData('Review', knownGameReviews);
  await processData('UnprocessedReviews', unknownGameReviews);
  console.log('Finished inserting...');
};

interface Review {
  id: number;
  appid: number;
  recommendationid: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const loadReviews = async (fileName: string) => {
  // const stream = fs.createReadStream(fileName);
  const CHUNK_SIZE = 250;
  let buffer: Review[] = [];
  const readableStream = fs.createReadStream(fileName).pipe(parse({ headers: true }));
  for await (const row of readableStream) {
    buffer.push(row);
    if (buffer.length >= CHUNK_SIZE) {
      await processResults(buffer); // Process chunk
      buffer = []; // Clear buffer
    }
  }

  // Process remaining rows
  if (buffer.length > 0) {
    await processResults(buffer);
  }
  
};

(async () => {
  await loadList(categories, 'Category');
  await loadList(genres, 'Genre');
  await loadList(tags, 'Tag');
  await loadGames(knownGames);
  await loadList(gameCategories as JoinData, 'GameCategory', 100, ['categoryID', 'gameID']);
  await loadList(gameTags as JoinData, 'GameTag', 100, ['tagID', 'gameID']);
  await loadList(gameGenres as JoinData, 'GameGenre', 100, ['genreID', 'gameID']);
  await loadReviews('output/clean-reviews.csv');
  process.exit(1);
})();