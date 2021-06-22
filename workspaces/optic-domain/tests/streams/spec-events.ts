import Tap from 'tap';
import * as AT from '../../src/async-tools';
import { SpecEvents } from '../../src/streams';

Tap.test('SpecEvents.takeUntilBatch', async (test) => {
  await test.test('takes events until a batch commit id', async (t) => {
    const exampleEvents = createExampleEvents();
    const batchesUntil = SpecEvents.takeBatchesUntil(
      'c357b18e-657b-49c8-a430-5e992adc1824'
    )(AT.from(exampleEvents));
    const results = await AT.toArray<any>(batchesUntil);
    test.matchSnapshot(results);
  });
});

function createExampleEvents() {
  return [
    {
      BatchCommitStarted: {
        batchId: '254b7e9e-053c-45f7-b18f-8a78782de2aa',
        commitMessage: 'Initialize specification attributes',
        eventContext: {
          clientId: 'anonymous',
          clientSessionId: 'unknown-session',
          clientCommandBatchId: '254b7e9e-053c-45f7-b18f-8a78782de2aa',
          createdAt: '2021-06-18T11:50:47.649234-07:00',
        },
        parentId: 'root',
      },
    },
    {
      ContributionAdded: {
        id: 'metadata',
        key: 'id',
        value: 'a18156d3-f477-4c6e-a110-f7f91340772d',
        eventContext: {
          clientId: 'anonymous',
          clientSessionId: 'unknown-session',
          clientCommandBatchId: '254b7e9e-053c-45f7-b18f-8a78782de2aa',
          createdAt: '2021-06-18T11:50:47.649234-07:00',
        },
      },
    },
    {
      BatchCommitEnded: {
        batchId: '254b7e9e-053c-45f7-b18f-8a78782de2aa',
        eventContext: {
          clientId: 'anonymous',
          clientSessionId: 'unknown-session',
          clientCommandBatchId: '254b7e9e-053c-45f7-b18f-8a78782de2aa',
          createdAt: '2021-06-18T11:50:47.649234-07:00',
        },
      },
    },
    {
      BatchCommitStarted: {
        batchId: 'c357b18e-657b-49c8-a430-5e992adc1824',
        commitMessage: '1',
        eventContext: {
          clientId: 'anonymous',
          clientSessionId: '9f6e6ba9-a3ac-4a91-a44c-8748f45be5b1',
          clientCommandBatchId: 'c357b18e-657b-49c8-a430-5e992adc1824',
          createdAt: '2021-06-18T11:50:53.353813-07:00',
        },
        parentId: '254b7e9e-053c-45f7-b18f-8a78782de2aa',
      },
    },
    {
      RequestAdded: {
        requestId: 'request_TukeTP2v7j',
        pathId: 'root',
        httpMethod: 'GET',
        eventContext: {
          clientId: 'anonymous',
          clientSessionId: '9f6e6ba9-a3ac-4a91-a44c-8748f45be5b1',
          clientCommandBatchId: 'c357b18e-657b-49c8-a430-5e992adc1824',
          createdAt: '2021-06-18T11:50:53.353813-07:00',
        },
      },
    },
    {
      BatchCommitEnded: {
        batchId: 'c357b18e-657b-49c8-a430-5e992adc1824',
        eventContext: {
          clientId: 'anonymous',
          clientSessionId: '9f6e6ba9-a3ac-4a91-a44c-8748f45be5b1',
          clientCommandBatchId: 'c357b18e-657b-49c8-a430-5e992adc1824',
          createdAt: '2021-06-18T11:50:53.353813-07:00',
        },
      },
    },
  ];
}
