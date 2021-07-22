import { generatePathCommands } from '<src>/lib/stable-path-batch-generator';
import { IPendingEndpoint } from '<src>/pages/diffs/contexts/SharedDiffState';
import { buildUniverse } from '<src>/lib/__tests/diff-helpers/universes/buildUniverse';
import { AllPathsQuery } from '<src>/store/paths/thunks';

const gitHubExample = [
  '/users/:username/orgs',
  '/users/:username/recieved_events',
  '/repos/:orgOrUser/:repo',
  '/repos/:orgOrUser/:repo/deployments/:deploymentId',
  '/users/:username',
  '/license/:licence',
  '/repos/:orgOrUser/:repo/deployments/:deploymentId',
  '/users/:username',
  '/license/:licence',
];

const pendingEndpoints: IPendingEndpoint[] = gitHubExample.map((i, index) => {
  const a: IPendingEndpoint = {
    ref: undefined,
    staged: false,
    pathPattern: i,
    id: 'pending_' + index.toString(),
    matchesPattern: (a, b) => false,
    method: index > 4 ? 'GET' : 'POST',
  };
  return a;
});

test('can match pending endpoints to pathIds for empty spec', async () => {
  const universe = await buildUniverse({
    session: { samples: [] },
    events: [],
  });

  const results = await generatePathCommands(
    pendingEndpoints,
    universe.currentSpecContext
  );

  const spectacle = await universe.forkSpectacleWithCommands(results.commands);

  expect(results).toMatchSnapshot();
  expect(await getPathsInSpec(spectacle)).toMatchSnapshot();
});

test('can match pending endpoints to pathIds in existing spec', async () => {
  const universe = await buildUniverse({
    session: { samples: [] },
    events: [
      {
        BatchCommitStarted: {
          batchId: '4409995b-11e6-409f-9d33-bbd82f52a279',
          commitMessage: '',
          eventContext: {
            clientId: 'anonymous',
            clientSessionId: 'b512abb9-3fb9-4b11-814b-bd99d7a3a2ea',
            clientCommandBatchId: '4409995b-11e6-409f-9d33-bbd82f52a279',
            createdAt: '2021-05-11T16:39:01.349Z',
          },
        },
      },
      {
        PathComponentAdded: {
          pathId: 'path_gRFd6gar3R',
          parentPathId: 'root',
          name: 'users',
          eventContext: {
            clientId: 'anonymous',
            clientSessionId: 'b512abb9-3fb9-4b11-814b-bd99d7a3a2ea',
            clientCommandBatchId: '4409995b-11e6-409f-9d33-bbd82f52a279',
            createdAt: '2021-05-11T16:39:01.353Z',
          },
        },
      },
      {
        PathParameterAdded: {
          pathId: 'path_IvuyljKjYc',
          parentPathId: 'path_gRFd6gar3R',
          name: 'username',
          eventContext: null,
        },
      },
      {
        PathComponentAdded: {
          pathId: 'path_VtujorMip3',
          parentPathId: 'path_IvuyljKjYc',
          name: 'orgs',
          eventContext: {
            clientId: 'anonymous',
            clientSessionId: 'b512abb9-3fb9-4b11-814b-bd99d7a3a2ea',
            clientCommandBatchId: '4409995b-11e6-409f-9d33-bbd82f52a279',
            createdAt: '2021-05-11T16:39:01.356Z',
          },
        },
      },
      {
        PathComponentAdded: {
          pathId: 'path_mN3kTKvX5V',
          parentPathId: 'path_IvuyljKjYc',
          name: 'received_events',
          eventContext: {
            clientId: 'anonymous',
            clientSessionId: 'b512abb9-3fb9-4b11-814b-bd99d7a3a2ea',
            clientCommandBatchId: '4409995b-11e6-409f-9d33-bbd82f52a279',
            createdAt: '2021-05-11T16:39:01.356Z',
          },
        },
      },
      {
        PathComponentAdded: {
          pathId: 'path_h5XuCUyuux',
          parentPathId: 'root',
          name: 'repos',
          eventContext: {
            clientId: 'anonymous',
            clientSessionId: 'b512abb9-3fb9-4b11-814b-bd99d7a3a2ea',
            clientCommandBatchId: '4409995b-11e6-409f-9d33-bbd82f52a279',
            createdAt: '2021-05-11T16:39:01.356Z',
          },
        },
      },
      {
        BatchCommitEnded: {
          batchId: '4409995b-11e6-409f-9d33-bbd82f52a279',
          eventContext: {
            clientId: 'anonymous',
            clientSessionId: 'b512abb9-3fb9-4b11-814b-bd99d7a3a2ea',
            clientCommandBatchId: '4409995b-11e6-409f-9d33-bbd82f52a279',
            createdAt: '2021-05-11T16:39:01.823Z',
          },
        },
      },
    ],
  });

  const results = await generatePathCommands(
    pendingEndpoints,
    universe.currentSpecContext
  );

  const spectacle = await universe.forkSpectacleWithCommands(results.commands);

  expect(results).toMatchSnapshot();
  expect(await getPathsInSpec(spectacle)).toMatchSnapshot();
});

async function getPathsInSpec(spectacle: any) {
  const results = await spectacle.queryWrapper({
    query: AllPathsQuery,
    variables: {},
  });

  return results.data;
}
