import Tap from 'tap';
import { makeSpectacle } from '../src';
import * as OpticEngine from '@useoptic/diff-engine-wasm/engine/build';

Tap.test('spectacle batchCommits query', async (test) => {
  const spectacle = await makeSpectacle(OpticEngine, {
    specRepository: {
      async listEvents(): Promise<any[]> {
        return [];
      }
    }
  });
  const results = await spectacle({
    query: `{
        batchCommits {
          createdAt
          batchId
        }
      }`,
    variables: {}
  });
  test.matchSnapshot(results);
});