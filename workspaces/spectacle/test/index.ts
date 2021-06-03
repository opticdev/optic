import Tap from 'tap';
import { makeSpectacle } from '../src';
import * as OpticEngine from '@useoptic/optic-engine-wasm';
import { InMemoryOpticContextBuilder } from '../src/in-memory';
import { loadEvents } from './utils';

// Getting the previous batch commit ID is manual and error prone
// This function automates that step
function fromPreviousBatchCommitId(
  name: string,
  file: string,
  extra: any = {}
) {
  const events: any = loadEvents(file);

  let previousBatchCommitId;
  let lastBatchCommitId = null;

  for (const event of events) {
    if ('BatchCommitStarted' in event) {
      previousBatchCommitId = lastBatchCommitId;
      lastBatchCommitId = event.BatchCommitStarted.batchId;
    }
  }

  return {
    ...extra,
    name,
    events,
    sinceBatchCommitId: previousBatchCommitId,
  };
}

// TODO: make this clear there are two sets of specs
const shapeId1 = 'shape_jSAthS01Bb';
const shapeId2 = 'shape_Uepabr07Dx';

const specs = [
  {
    name: 'add new endpoint',
    events: loadEvents('./test/specs/add-new-endpoint.json'),
    sinceBatchCommitId: null,
    shapeId: shapeId1,
  },
  fromPreviousBatchCommitId(
    'add optional response field',
    './test/specs/add-optional-res-field.json',
    { shapeId: shapeId1 }
  ),
  fromPreviousBatchCommitId(
    'add required response field',
    './test/specs/add-required-res-field.json',
    { shapeId: shapeId1 }
  ),
  fromPreviousBatchCommitId(
    'add response status code',
    './test/specs/add-res-status-code.json',
    { shapeId: shapeId1 }
  ),
  fromPreviousBatchCommitId(
    'update optional response field',
    './test/specs/update-optional-res-field.json',
    { shapeId: shapeId1 }
  ),
  fromPreviousBatchCommitId(
    'add endpoint to existing spec',
    './test/specs/add-endpoint-to-existing-spec.json',
    { shapeId: shapeId1 }
  ),
  // Use an existing spec but pick last batch commit
  {
    name: 'no changes',
    events: loadEvents('./test/specs/add-endpoint-to-existing-spec.json'),
    sinceBatchCommitId: '42355178-d7d7-4510-a261-bf7f579d71a3',
    shapeId: shapeId1,
  },
  fromPreviousBatchCommitId('complex changes', './test/specs/complex.json', {
    shapeId: shapeId1,
  }),
  fromPreviousBatchCommitId(
    'add nested response field',
    './test/specs/add-res-nested-field.json',
    { shapeId: 'shape_JMawGfOvqm' }
  ),
  fromPreviousBatchCommitId(
    'update nested response field',
    './test/specs/update-res-nested-field.json',
    { shapeId: 'shape_JMawGfOvqm' }
  ),
  fromPreviousBatchCommitId(
    'add response array field',
    './test/specs/add-res-array-field.json',
    { shapeId: 'shape_Fp2ke8xB9K' }
  ),
  fromPreviousBatchCommitId(
    'add response as an array',
    './test/specs/add-res-as-array.json',
    { shapeId: 'shape_Sn2bnZvvoM' }
  ),
  fromPreviousBatchCommitId(
    'updated response as an array',
    './test/specs/update-res-as-array.json',
    { shapeId: 'shape_Sn2bnZvvoM' }
  ),
  fromPreviousBatchCommitId(
    'add response as an array with object',
    './test/specs/add-res-as-array-with-object.json',
    { shapeId: 'shape_oCUwskX7xA' }
  ),
  fromPreviousBatchCommitId(
    'add request and response',
    './test/specs/add-req-and-res.json',
    { shapeId: shapeId2 }
  ),
  fromPreviousBatchCommitId(
    'add request field',
    './test/specs/add-req-field.json',
    { shapeId: shapeId2 }
  ),
  fromPreviousBatchCommitId(
    'add request nested field',
    './test/specs/add-req-nested-field.json',
    { shapeId: shapeId2 }
  ),
  fromPreviousBatchCommitId(
    'update request field type',
    './test/specs/update-req-field-type.json',
    { shapeId: shapeId2 }
  ),
  fromPreviousBatchCommitId(
    'mark request field optional',
    './test/specs/mark-req-field-optional.json',
    { shapeId: shapeId2 }
  ),
  fromPreviousBatchCommitId(
    'mark request nested field optional',
    './test/specs/mark-req-nested-field-optional.json',
    { shapeId: shapeId2 }
  ),
  fromPreviousBatchCommitId(
    'add contributions',
    './test/specs/add-endpoint-contributions.json'
  ),
];

Tap.test('spectacle batchCommits query', async (test) => {
  const opticContext = await InMemoryOpticContextBuilder.fromEvents(
    OpticEngine,
    []
  );
  const spectacle = await makeSpectacle(opticContext);

  const results = await spectacle.queryWrapper({
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
  const opticContext = await InMemoryOpticContextBuilder.fromEvents(
    OpticEngine,
    spec.events
  );
  const spectacle = await makeSpectacle(opticContext);

  Tap.test(`spectacle changelog query ${spec.name}`, async (test) => {
    const query = `{
      endpointChanges(sinceBatchCommitId: "${spec.sinceBatchCommitId || ''}") {
        endpoints {
          change {
            category
          }
          contributions
          pathId
          path
          method
        }
      }
    }`;

    const results = await spectacle.queryWrapper({ query, variables: {} });
    test.matchSnapshot(results);
  });

  Tap.test(`spectacle shapeChoices query ${spec.name}`, async (test) => {
    const query = `{
      shapeChoices(shapeId: "${spec.shapeId}") {
        id
        jsonType
        asArray {
          changes(sinceBatchCommitId: "${spec.sinceBatchCommitId || ''}") {
            added
            changed
          }
        }
        asObject {
          fields {
            shapeId
            fieldId
            name
            changes(sinceBatchCommitId: "${spec.sinceBatchCommitId || ''}") {
              added
              changed
            }
          }
        }
      }
    }`;
    const results = await spectacle.queryWrapper({ query, variables: {} });
    test.matchSnapshot(results);
  });

  Tap.test(`spectacle paths query ${spec.name}`, async (test) => {
    const query = `{
      paths {
        absolutePathPattern
        absolutePathPatternWithParameterNames
        isParameterized
        name
        pathId
      }
    }`;

    const results = await spectacle.queryWrapper({ query, variables: {} });
    test.matchSnapshot(results);
  });
});
