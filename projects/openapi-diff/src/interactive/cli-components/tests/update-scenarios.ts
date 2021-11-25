import { oneEndpointWithLargeGitHubExample } from '../../../test/scenarios/specs';
import { DebugTraffic } from '../../../test/scenarios/traffic';
import { TestScenarioRunner } from '../../../test/scenarios/scenarios';

const newField = async () => {
  const scenario = await oneEndpointWithLargeGitHubExample();

  scenario.sendTraffic(
    DebugTraffic('put', '/example').withJsonResponse({
      owner: {
        created_at: '09/12/2021',
        login: 'opticdev',
        id: 34556970,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjM0NTU2OTcw',
        avatar_url: 'https://avatars.githubusercontent.com/u/34556970?v=4',
        url: 'https://api.github.com/users/opticdev',
        html_url: 'https://github.com/opticdev',
        followers_url: 'https://api.github.com/users/opticdev/followers',
        type: 'Organization',
      },
    })
  );
  return scenario;
};

////////////////////////////////////////////////////////////////////////

export const toExport: { [key: string]: () => Promise<TestScenarioRunner> } = {
  newField,
};

export default toExport;
