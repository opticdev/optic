import { it, beforeEach, describe, expect } from '@jest/globals';
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
        .findOperation('/not-a-valid-path', HttpMethods.GET)
        .expect('unambigious paths to be ok');

      expect(result.none).toBe(true);
    });

    it('can match /', () => {
      const result = queries
        .findOperation('/', HttpMethods.GET)
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result.unwrap()).toMatchSnapshot();
    });

    it('will match concrete paths in set', () => {
      const result = queries
        .findOperation('/app/hook/config', HttpMethods.GET)
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result.unwrap()).toMatchSnapshot();
    });

    it('will match concrete paths with parameters set', () => {
      const result = queries
        .findOperation(
          '/orgs/an-org/actions/runner-groups/group-1/repositories/repo-1',
          HttpMethods.GET
        )
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result.unwrap()).toMatchSnapshot();
    });

    it('will not match partial paths', () => {
      const result = queries
        .findOperation(
          '/orgs/an-org/actions/runner-groups/group-1',
          HttpMethods.GET
        )
        .expect('unambigious paths to be ok');

      expect(result.none).toBe(true);
    });

    it('will match method', () => {
      const result = queries
        .findOperation('/app/hook/config', HttpMethods.POST)
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result.unwrap()).toMatchSnapshot();
    });

    it('will not operations without matching method', () => {
      const result = queries
        .findOperation('/app/hook/config', HttpMethods.DELETE)
        .expect('unambigious paths to be ok');

      expect(result.none).toBe(true);
    });

    // known limitation -- nested ambiguous may not work properly
    describe('ambigious paths', () => {
      it('will match exact matches', () => {
        const result = queries
          .findOperation('/venues/top', HttpMethods.GET)
          .expect('exact matching paths to be ok');

        expect(result.some).toBe(true);
        expect(result.unwrap()).toMatchSnapshot();
      });

      it('will match parameterized path', () => {
        const result = queries
          .findOperation('/venues/venue123', HttpMethods.GET)
          .expect('unnested parameterized paths to be ok');

        expect(result.some).toBe(true);
        expect(result.unwrap()).toMatchSnapshot();
      });
    });

    describe('base urls', () => {
      let queries: OperationQueries;
      beforeEach(() => {
        queries = new OperationQueries(
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
          ]),
          ['https://useoptic.com/v1', '/v2', '/versions/v3']
        );
      });

      it('will match operations prefixed by the path of an absolute base url', () => {
        const result = queries
          .findOperation('/v1/app/hook/config', HttpMethods.GET)
          .expect('unambigious paths to be ok');

        expect(result.some).toBe(true);
        expect(result.unwrap()).toMatchSnapshot();
      });

      it('will not match non-prefixed operations when base urls given', () => {
        const result = queries
          .findOperation('/app/hook/config', HttpMethods.GET)
          .expect('unambigious paths to be ok');

        expect(result.none).toBe(true);
      });

      it('will match operations prefixed by the path of a relative base url', () => {
        const result = queries
          .findOperation('/v2/app/hook/config', HttpMethods.GET)
          .expect('unambigious paths to be ok');

        expect(result.some).toBe(true);
        expect(result.unwrap()).toMatchSnapshot();
      });

      it('will match operations prefixed by the path of a base url with multiple components', () => {
        const result = queries
          .findOperation('/versions/v3/app/hook/config', HttpMethods.GET)
          .expect('unambigious paths to be ok');

        expect(result.some).toBe(true);
        expect(result.unwrap()).toMatchSnapshot();
      });
    });
  });

  describe('findPathPattern', () => {
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
      ]),
      ['https://useoptic.com/v1', '/v2', '/versions/v3']
    );

    it('will not match paths outside of set', () => {
      const result = queries
        .findPathPattern('/not-a-valid-path')
        .expect('unambigious paths to be ok');

      expect(result.none).toBe(true);
    });

    it('can match /', () => {
      const result = queries
        .findPathPattern('/')
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result.unwrap()).toMatchSnapshot();
    });

    it('will match concrete paths in set', () => {
      const result = queries
        .findPathPattern('/app/hook/config')
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result.unwrap()).toMatchSnapshot();
    });

    it('will match concrete paths with parameters set', () => {
      const result = queries
        .findPathPattern(
          '/orgs/an-org/actions/runner-groups/group-1/repositories/repo-1'
        )
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result.unwrap()).toMatchSnapshot();
    });

    it('will not match partial paths', () => {
      const result = queries
        .findPathPattern('/orgs/an-org/actions/runner-groups/group-1')
        .expect('unambigious paths to be ok');

      expect(result.none).toBe(true);
    });

    it('will match a parameterised pattern', () => {
      const result = queries
        .findPathPattern(
          '/orgs/{org}/actions/runner-groups/{none_documented_name}/repositories/{repository_id}'
        )
        .expect('unambigious paths to be ok');

      expect(result.some).toBe(true);
      expect(result.unwrap()).toMatchSnapshot();
    });
  });
});
