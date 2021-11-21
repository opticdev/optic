import { scenarios } from './scenarios';
import { baselineIntent } from '../../interactive/agents/intents/baseline';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { makeExample } from '../../services/traffic/traffic/debug-simple';

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
