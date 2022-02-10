import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPatcher } from '../../../../patch/incremental-json-patch/json-patcher';
import { addNewOperation } from '../new-operation';
import { opticJsonSchemaDiffer } from '../../json-schema-json-diff';
import { defaultEmptySpec } from '../../../../read/debug-implementations';
import { ApiTraffic } from '../../../../traffic/types';
import { makeExample } from '../../../../traffic/traffic/debug-simple';
import { DebugTraffic } from '../../../../../test/scenarios/traffic';

describe('new operations', () => {
  it('can be added to an empty spec', async () => {
    const addOperation = await fixture(
      defaultEmptySpec,
      makeExample(
        '/example/{example_id}/status',
        OpenAPIV3.HttpMethods.GET,
        '200',
        {
          id: 123606765,
          node_id: 'MDEwOlJlcG9zaXRvcnkxMjM2MDY3NjU=',
          name: 'optic',
          full_name: 'opticdev/optic',
          private: false,
          owner: {
            login: 'opticdev',
            id: 34556970,
          },
        }
      )
    );

    expect(addOperation).toMatchSnapshot();
  });

  it('operation with request and response body can be added to an empty spec', async () => {
    const addOperation = await fixture(
      defaultEmptySpec,
      DebugTraffic(OpenAPIV3.HttpMethods.PATCH, '/example/123606765/status')
        .withJsonRequest({
          full_name: 'opticdev/optic',
          private: false,
        })
        .withJsonResponse({
          id: 123606765,
          node_id: 'MDEwOlJlcG9zaXRvcnkxMjM2MDY3NjU=',
          name: 'optic',
          full_name: 'opticdev/optic',
          private: false,
          owner: {
            login: 'opticdev',
            id: 34556970,
          },
        })
    );

    expect(addOperation).toMatchSnapshot();
  });
});

async function fixture(openApi: OpenAPIV3.Document, example: ApiTraffic) {
  // constraint, expects the operation is missing (path can be there)
  const startingDoc = jsonPatcher(openApi);

  const result = addNewOperation(
    startingDoc,
    example.path,
    example.method as OpenAPIV3.HttpMethods,
    example,
    opticJsonSchemaDiffer() // use default differ so snapshots are based on the latest released plugins
  );

  return {
    openapi: startingDoc.currentDocument(),
    patches: result.patches,
    operation: result.operation,
  };
}
