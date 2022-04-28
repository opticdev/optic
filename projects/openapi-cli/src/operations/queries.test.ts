import { OperationQueries } from './queries';
import { SpecFacts, OpenAPIV3 } from '../specs';
import { collect } from '../lib/async-tools';
import { petstore } from '../tests/fixtures/facts';

const gitHubOpenApiPaths = require('../tests/inputs/githubpaths.json');

const { HttpMethods } = OpenAPIV3;

describe('OperationsQueries', () => {
  it('can be created from operation facts', async () => {
    const operationFacts = await collect(SpecFacts.operationFacts(petstore()));

    OperationQueries.fromFacts(operationFacts);
  });

  describe('findSpecPath', () => {
    const queries = new OperationQueries(
      gitHubOpenApiPaths.map((pathPattern, i) => ({
        pathPattern,
        method: HttpMethods.GET,
        specPath: `debug-path-${i}`, // spec paths don't have to be actual OpenAPI paths, just be unique
      }))
    );

    it('will not match paths outside of set', () => {
      const result = queries
        .findSpecPath('/not-a-github-path', HttpMethods.GET)
        .expect('unambigious paths to be ok');

      expect(result.none).toBe(true);
    });

    it('can match /', () => {
      const result = queries
        .findSpecPath('/', HttpMethods.GET)
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result.unwrap()).toMatchSnapshot();
    });

    it('will match concrete paths in set', async () => {
      const result = queries
        .findSpecPath('/app/hook/config', HttpMethods.GET)
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result).toMatchSnapshot();
    });
  });
});
