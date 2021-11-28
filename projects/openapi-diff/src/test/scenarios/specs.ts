import { scenarios } from './scenarios';
import { baselineIntent } from '../../interactive/agents/intents/baseline';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { makeExample } from '../../services/traffic/traffic/debug-simple';
import { DebugTraffic } from './traffic';

export const emptySpec = () =>
  scenarios(baselineIntent()).initialSpec({
    openapi: '3.0.1',
    paths: {},
    info: { version: '0.0.0', title: 'Empty' },
  });

export const oneEndpointExampleSpec = async () =>
  await scenarios(baselineIntent()).buildSpecFrom((patch) => {
    patch.init.operation(
      '/example',
      OpenAPIV3.HttpMethods.GET,
      makeExample('/example', 'get', '200', { hello: 'world' })
    );
  });

export const oneEndpointExampleSpecWithRequestBody = async () =>
  await scenarios(baselineIntent()).buildSpecFrom((patch) => {
    patch.init.operation(
      '/example',
      OpenAPIV3.HttpMethods.POST,
      DebugTraffic('/example', OpenAPIV3.HttpMethods.POST)
        .withStatusCode('200')
        .withJsonResponse({ hello: 'world' })
        .withJsonRequest({ goodbye: 'earth' })
    );
  });

export const oneEndpointWithLargeGitHubExample = async () =>
  await scenarios(baselineIntent()).buildSpecFrom((patch) => {
    patch.init.operation(
      '/example',
      OpenAPIV3.HttpMethods.GET,
      makeExample('/example', 'get', '200', {
        owner: {
          login: 'opticdev',
          id: 34556970,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjM0NTU2OTcw',
          avatar_url: 'https://avatars.githubusercontent.com/u/34556970?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/opticdev',
          html_url: 'https://github.com/opticdev',
          followers_url: 'https://api.github.com/users/opticdev/followers',
          type: 'Organization',
          site_admin: false,
        },
      })
    );
  });
