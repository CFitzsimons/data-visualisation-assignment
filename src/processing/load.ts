import * as v8 from 'v8';

import knex from './knex';
import fs from 'fs';

import Papa from 'papaparse';
type ListData = { name: string }[];
type GameData = { name: string; id: number; }[];

import categories from '../../output/categories.json';
import genres from '../../output/genres.json';
import tags from '../../output/tags.json';
import games from '../../output/games.json';

const knownGames = games as GameData;
console.log(`Heap Size Limit: ${v8.getHeapStatistics().heap_size_limit / 1024 / 1024} MB`);

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

const processResults = async (result: Review[], chunk: number) => {
  if (result.length === 0) {
    return;
  }

  const mappedReviews = result.map((item) => ({
    id: item.recommendationid.toString(),
    gameID: item.appid,
    review: item.review,
    updated: new Date(item.timestamp_created),
    created: new Date(item.timestamp_updated),
    positive: item.voted_up === 1,
    upvotes: item.votes_up,
    funnyVotes: item.votes_funny,
  }));

  const knownGameIds = new Set(knownGames.map((game) => game.id));
  const knownGameReviews = mappedReviews.filter((r) => knownGameIds.has(r.gameID));
  const unknownGameReviews = mappedReviews.filter((r) => !knownGameIds.has(r.gameID));

  if (unknownGameReviews.length > 0) {
    const writeStream = fs.createWriteStream(`output/unknownGameReviews/${chunk}.json`);
    writeStream.write(JSON.stringify(unknownGameReviews, null, 2));
    writeStream.end();
  }

  const CHUNK_SIZE_DB = 50; // Smaller DB chunk size for better memory handling
  for (let i = 0; i < knownGameReviews.length; i += CHUNK_SIZE_DB) {
    const chunkToInsert = knownGameReviews.slice(i, i + CHUNK_SIZE_DB);
    let q;
    try {

      q = knex('Review')
      .insert(chunkToInsert)
      .onConflict(['id'])
      .ignore();
      await q;
    } catch (err) {
      console.log(err);
      fs.writeFileSync('out.log', JSON.stringify(q?.toSQL()));
    }
    await new Promise((resolve) => setTimeout(resolve, 10)); // Add delay
  }
};

interface Review {
  id: number;
  appid: number;
  recommendationid: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const loadReviews = (fileName: string) => {
  const CHUNK_SIZE = 50;
  let chunk = 0;
  return new Promise((parseResolve) => {
    const readable = fs.createReadStream(fileName);
    Papa.parse<Review>(readable, {
      header: true,
      dynamicTyping: true,
      chunkSize: CHUNK_SIZE,
      complete: () => {
        parseResolve(1);
      },
      chunk: (rows, parser) => {
        chunk = chunk + CHUNK_SIZE;
        parser.pause();
        new Promise((resolve) => {
          processResults(rows.data, chunk)
            .then(() => {
              parser.resume();
              resolve(1);
            });
        });
      }
    });
  });
};

(async () => {
  await loadList(categories, 'Category');
  await loadList(genres, 'Genre');
  await loadList(tags, 'Tag');
  await loadGames(knownGames);
  await loadReviews('output/clean-reviews.csv');
  process.exit(1);
})();