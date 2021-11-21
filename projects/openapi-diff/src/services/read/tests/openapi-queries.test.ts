import { openapiutils } from '../../../test/test-data-dirs';
import * as path from 'path';
import { openApiQueries } from '../queries';
import { OpenAPIDiffingQuestions } from '../types';
import { parseOpenAPIWithSourcemap } from '@useoptic/openapi-io';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

function queriesFixture(input: string): Promise<OpenAPIDiffingQuestions> {
  return new Promise(async (resolve) => {
    const { jsonLike } = await parseOpenAPIWithSourcemap(input);
    const queries = openApiQueries(jsonLike);
    resolve(queries);
  });
}

describe('openapi queries', () => {
  it('get operations', async () => {
    const queries = await queriesFixture(
      path.join(openapiutils, 'openapi3', 'petstore0.json')
    );
    expect(queries.operations()).toMatchSnapshot();
  });

  it('get paths', async () => {
    const queries = await queriesFixture(
      path.join(openapiutils, 'openapi3', 'petstore0.json')
    );
    expect(queries.operations()).toMatchSnapshot();
  });

  it('get query params', async () => {
    const queries = await queriesFixture(
      path.join(openapiutils, 'openapi3', 'petstore0.json')
    );
    expect(
      queries.queryParametersForOperation(
        OpenAPIV3.HttpMethods.GET,
        '/user/{username}'
      )
    ).toMatchSnapshot();
    expect(
      queries.queryParametersForOperation(
        OpenAPIV3.HttpMethods.GET,
        '/user/{username}'
      )
    ).toMatchSnapshot();
  });
});
