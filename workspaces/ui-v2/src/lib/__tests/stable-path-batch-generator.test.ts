import { generatePathCommands } from '<src>/lib/stable-path-batch-generator';
import { IPendingEndpoint } from '<src>/optic-components/hooks/diffs/SharedDiffState';

const gitHubExample = [
  '/users/:username/orgs',
  '/users/:username/recieved_events',
  '/repos/:orgOrUser/:repo',
  '/repos/:orgOrUser/:repo/deployments/:deploymentId',
  '/users/:username',
  '/license/:licence',
];

test('accurate spec trail for all diffs', async () => {
  const pendingEndpoints: IPendingEndpoint[] = gitHubExample.map((i) => {
    const a: IPendingEndpoint = {
      staged: false,
      pathPattern: i,
      method: 'GET',
    };
    return a;
  });

  generatePathCommands(pendingEndpoints);
});
