import { OperationQueries } from './queries';
import { SpecFacts, OpenAPIV3 } from '../specs';
import { collect } from '../lib/async-tools';
import { petstore } from '../tests/fixtures/facts';

const { HttpMethods } = OpenAPIV3;

describe('OperationsQueries', () => {
  it('can be created from operation facts', async () => {
    const operationFacts = await collect(SpecFacts.operationFacts(petstore()));

    OperationQueries.fromFacts(operationFacts);
  });

  describe('findSpecPath', () => {
    const testPaths = [
      '/',
      '/app/hook/config',
      '/orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}',
    ];

    const queries = new OperationQueries(
      testPaths.flatMap((pathPattern, i) => [
        {
          pathPattern,
          method: HttpMethods.GET,
          specPath: `debug-path-${i}-get`, // spec paths don't have to be actual OpenAPI paths, just be unique
        },
        {
          pathPattern,
          method: HttpMethods.POST,
          specPath: `debug-path-${i}-post`,
        },
      ])
    );

    it('will not match paths outside of set', () => {
      const result = queries
        .findSpecPath('/not-a-valid-path', HttpMethods.GET)
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
      expect(result.unwrap()).toMatchSnapshot();
    });
  });
});
