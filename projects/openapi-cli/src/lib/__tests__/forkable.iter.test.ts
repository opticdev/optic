import { test, expect } from '@jest/globals';
import { forkable } from '../async-tools';
import * as AT from 'axax';

test('can fork iterables', async () => {
  let words = 'this is a sentence'.split(' ');
  let forkableWords = forkable(AT.from(words));
  let observedResults: string[] = [];

  let consuming = (async function () {
    for await (let word of forkableWords.fork()) {
      observedResults.push(word);
    }
  })();

  forkableWords.start();

  await consuming;

  expect(observedResults).toEqual(words);
});

test('forks share backpressure and run in lock-step', async () => {
  let words = AT.from('this is a sentence'.split(' '));

  let observedResults: string[] = [];

  const fast = async function (source) {
    for await (let item of source) {
      observedResults.push(`fast: ${item}`);
    }
  };

  const slow = async function (source) {
    for await (let item of source) {
      await new Promise((r) => setTimeout(r, 100));
      observedResults.push(`slow: ${item}`);
    }
  };

  let forkableWords = forkable(words);

  let forkOne = forkableWords.fork();
  let forkTwo = forkableWords.fork();
  forkableWords.start();

  await Promise.all([fast(forkOne), slow(forkTwo)]);

  expect(observedResults).toHaveLength(8);
  expect(observedResults).toMatchSnapshot();
});
