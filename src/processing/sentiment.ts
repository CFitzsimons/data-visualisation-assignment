import { AutoModel, pipeline, TextClassificationOutput, TextClassificationSingle } from '@huggingface/transformers';
import knex from './knex';

type Sentiment = {
  id: string;
  name: string;
}

type Review = {
  id: string;
  sentimentID: null | string;
  review: string;
}


const nextChunk = async (chunkSize = 100) => {
  const reviews: Review[] = await knex('Review')
    .where({ sentimentID: null })
    .limit(chunkSize);
  return reviews;
};
type SentimentMap = { [key: string]: number; };
const getSentiments: () => Promise<SentimentMap> = async () => {
  const sentiments = await knex('Sentiment');
  console.log({ sentiments });
  if (sentiments.length === 0) {
    // init
    await knex('Sentiment')
      .insert({
        name: 'Unknown',
      });
    return getSentiments();
  }
  return sentiments.reduce((items, next) => ({
    ...items,
    [next.name]: next.id,
  }), {});
};

const performAnalysis = async () => {
  const pipe = await pipeline('text-classification', 'SamLowe/roberta-base-go_emotions-onnx');
  const sentimentCache = await getSentiments();
  while (true) {
    const chunk = await nextChunk();
    const promises = [];
    for (let i = 0; i < chunk.length; i += 1) {
      const promise = (async () => {
        const review = chunk[i];
        let s: TextClassificationSingle | TextClassificationOutput = { label: 'Unknown', score: 0 };
        try {
          const [piped] = await pipe([review.review]);
          s = piped;
        } catch {
          // do nothing... Record as an error.
        }
        const { label } = (s || {}) as { label: string };
        if (!s || !label) {
          await knex('Review')
            .update({ sentimentID: sentimentCache.Unknown });
        } else {
          let sentimentID = sentimentCache[label];
          if (!sentimentID) {
            const [result] = await knex('Sentiment')
              .insert({
                name: label,
              })
              .returning('id');
              sentimentCache[label] = result.id;
              sentimentID = result.id;
          }
          await knex('Review')
            .update({ sentimentID })
            .where({ id: review.id });
        }
      })();
      promises.push(promise);
    }
    await Promise.all(promises);
  }
};

performAnalysis();