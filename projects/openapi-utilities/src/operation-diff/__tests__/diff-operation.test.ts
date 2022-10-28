import fs from 'fs-extra';
import { normalizeOperation, OpenAPIOperation } from '../normalize-operation';
import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { diff } from '../diff';

const jsonFromFile = async (path: string) => {
  const bytes = await fs.readJson(path);
  return bytes;
};

function opWithParameters(
  parameters: OpenAPIV3.ParameterObject[]
): OpenAPIOperation {
  return {
    method: OpenAPIV3.HttpMethods.GET,
    path: '/example',
    coordinates: {
      absoluteJsonPath: jsonPointerHelpers.compile([
        'paths',
        '/example',
        'get',
      ]),
    },
    context: {
      sharedParameters: [],
      securitySchemas: {},
      environments: [],
    },
    coordinateAliases: {},
    operation: {
      parameters,
      responses: {},
      summary: '',
    },
  };
}

it('can normalize an openapi operation', async () => {
  const beforeOp = opWithParameters([
    { in: 'query', name: 'example', required: true, explode: true },
    {
      in: 'path',
      name: 'id',
      required: true,
      schema: {
        type: 'string',
      },
    },
  ]);
  const afterOp = opWithParameters([
    { in: 'query', name: 'example', required: false, description: 'this one' },
    {
      in: 'query',
      name: 'other-query',
      required: false,
      schema: {
        type: 'string',
      },
    },
  ]);
  const results = diff(beforeOp, afterOp);

  expect(results).toMatchSnapshot();
});
