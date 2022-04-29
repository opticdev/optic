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
    let testPaths = [
      '/',
      '/app/hook/config',
      '/orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}',
      '/venues/top',
      '/venues/featured',
      '/venues/{venueId}',
    ];

    let queries = new OperationQueries(
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

    it('will match concrete paths in set', () => {
      const result = queries
        .findSpecPath('/app/hook/config', HttpMethods.GET)
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result.unwrap()).toMatchSnapshot();
    });

    it('will match concrete paths with parameters set', () => {
      const result = queries
        .findSpecPath(
          '/orgs/an-org/actions/runner-groups/group-1/repositories/repo-1',
          HttpMethods.GET
        )
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result.unwrap()).toMatchSnapshot();
    });

    it('will not match partial paths', () => {
      const result = queries
        .findSpecPath(
          '/orgs/an-org/actions/runner-groups/group-1',
          HttpMethods.GET
        )
        .expect('unambigious paths to be ok');

      expect(result.none).toBe(true);
    });

    // known limitation -- nested ambiguous may not work properly
    describe('ambigious paths', () => {
      it('will match exact matches', () => {
        const result = queries
          .findSpecPath('/venues/top', HttpMethods.GET)
          .expect('exact matching paths to be ok');

        expect(result.some).toBe(true);
        expect(result.unwrap()).toMatchSnapshot();
      });

      it('will match parameterized path', () => {
        const result = queries
          .findSpecPath('/venues/venue123', HttpMethods.GET)
          .expect('unnested parameterized paths to be ok');

        expect(result.some).toBe(true);
        expect(result.unwrap()).toMatchSnapshot();
      });
    });
  });
});
