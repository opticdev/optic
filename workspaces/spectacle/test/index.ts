import * as fs from 'fs';
import Tap from 'tap';
import { makeSpectacle } from '../src';
import * as OpticEngine from '@useoptic/diff-engine-wasm/engine/build';
import { InMemoryOpticContextBuilder } from '../src/in-memory';

const specs = [
  {
    name: 'add new endpoint',
    file: './test/specs/add-new-endpoint.json',
    sinceCreatedAt: null,
    sinceBatchCommitId: null,
  },
  {
    name: 'add optional response field',
    file: './test/specs/add-optional-res-field.json',
    sinceCreatedAt: '2021-04-07T15:13:51.698Z',
    sinceBatchCommitId: '9c60b8fb-faec-43f3-a0fb-171306f98d61',
  },
  {
    name: 'add required response field',
    file: './test/specs/add-required-res-field.json',
    sinceCreatedAt: '2021-04-07T15:11:49.282Z',
    sinceBatchCommitId: '6c785ae0-ac1a-4c36-9fc9-e15c587459f8',
  },
  {
    name: 'add response status code',
    file: './test/specs/add-res-status-code.json',
    sinceCreatedAt: '2021-04-07T15:16:53.719Z',
    sinceBatchCommitId: '9ebee98a-77a0-4dfb-b240-966eb610274b',
  },
  {
    name: 'update optional response field',
    file: './test/specs/update-optional-res-field.json',
    sinceCreatedAt: '2021-04-07T15:15:16.190Z',
    sinceBatchCommitId: '5fb6357e-fc7a-4fac-8f00-db1589061e85',
  },
  {
    name: 'add endpoint to existing spec',
    file: './test/specs/add-endpoint-to-existing-spec.json',
    sinceCreatedAt: '2021-04-07T15:20:11.649Z',
    sinceBatchCommitId: 'c03ccae6-f3c9-4d9c-a3b6-3d710dbdb4ec',
  },
  // Use an existing spec but pick last batch commit
  {
    name: 'no changes',
    file: './test/specs/add-endpoint-to-existing-spec.json',
    sinceCreatedAt: '2021-04-07T15:52:15.419Z',
    sinceBatchCommitId: '42355178-d7d7-4510-a261-bf7f579d71a3',
  },
  {
    name: 'complex changes',
    file: './test/specs/complex.json',
    sinceCreatedAt: '2021-04-07T15:52:15.419Z',
    sinceBatchCommitId: '42355178-d7d7-4510-a261-bf7f579d71a3',
  },
];

Tap.test('spectacle batchCommits query', async (test) => {
  const opticContext = await InMemoryOpticContextBuilder.fromEvents(
    OpticEngine,
    [],
  );
  const spectacle = await makeSpectacle(opticContext);

  const results = await spectacle({
    query: `{
        batchCommits {
          createdAt
          batchId
        }
      }`,
    variables: {},
  });
  test.matchSnapshot(results);
});

specs.forEach(async (spec) => {
  Tap.test(`spectacle changelog query ${spec.name}`, async (test) => {
    const events = JSON.parse(fs.readFileSync(spec.file).toString('utf-8'));
    const opticContext = await InMemoryOpticContextBuilder.fromEvents(
      OpticEngine,
      events,
    );
    const spectacle = await makeSpectacle(opticContext);
    const query = spec.sinceCreatedAt
      ? `{
        endpointChanges(since: "${spec.sinceCreatedAt}") {
          endpoints {
            change {
              category
            }
            path
            method
          }
        }
      }`
      : `{
        endpointChanges {
          endpoints {
            change {
              category
            }
            path
            method
          }
        }
      }`;
    const results = await spectacle({ query, variables: {} });
    test.matchSnapshot(results);
  });
});
