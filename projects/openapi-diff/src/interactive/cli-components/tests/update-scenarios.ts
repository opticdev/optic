import { oneEndpointWithLargeGitHubExample } from '../../../test/scenarios/specs';
import { DebugTraffic } from '../../../test/scenarios/traffic';
import { SpecInterfaceFactory } from '../../../services/openapi-read-patch-interface';
import { ITrafficSource, TrafficSource } from '../../../services/traffic/types';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

const newField = async () => {
  const scenario = await oneEndpointWithLargeGitHubExample();

  return {
    source: scenario.source,
    specInterfaceFactory: scenario.specInterfaceFactory,
    start: () => {
      scenario.sendTraffic(
        DebugTraffic(OpenAPIV3.HttpMethods.GET, '/example').withJsonResponse({
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
    },
  };
};

////////////////////////////////////////////////////////////////////////

export const toExport: {
  [key: string]: () => Promise<{
    specInterfaceFactory: SpecInterfaceFactory;
    source: TrafficSource;
    start: () => void;
  }>;
} = {
  newField,
};

export default toExport;
