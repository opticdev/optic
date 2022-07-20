import { diffOperationWithSpec, OperationDiffResultKind } from '.';
import { HttpMethods } from '..';
import { OpenAPIV3 } from '../../specs';

describe('diffOperationWithSpec', () => {
  it('yields diffs for unmatched paths', () => {
    let testSpec: OpenAPIV3.Document = {
      openapi: '3.0.3',
      info: {
        title: 'test spec',
        version: '1.0.0',
      },
      paths: {
        '/orders/{orderId}/products': {
          get: {
            responses: {},
          },
        },
      },
    };

    const matchingResults = [
      ...diffOperationWithSpec(
        {
          pathPattern: '/orders/{orderId}/products',
          methods: [HttpMethods.GET],
        },
        testSpec
      ),
    ];
    expect(matchingResults).toHaveLength(0);

    const unmatchingPathResults = [
      ...diffOperationWithSpec(
        {
          pathPattern: '/orders/{orderId}/transaction',
          methods: [HttpMethods.GET],
        },
        testSpec
      ),
    ];
    expect(unmatchingPathResults).toHaveLength(1);
    let [unmatchedPathResult] = unmatchingPathResults;
    expect(unmatchedPathResult.kind).toBe(
      OperationDiffResultKind.UnmatchedPath
    );
    expect(unmatchedPathResult).toMatchSnapshot();
  });

  it('matches paths irrespective of template names', () => {
    let testSpec: OpenAPIV3.Document = {
      openapi: '3.0.3',
      info: {
        title: 'test spec',
        version: '1.0.0',
      },
      paths: {
        '/orders/{orderId}/products': {
          get: {
            responses: {},
          },
        },
      },
    };

    const matchingResults = [
      ...diffOperationWithSpec(
        {
          pathPattern: '/orders/{someOtherIdName}/products',
          methods: [HttpMethods.GET],
        },
        testSpec
      ),
    ];
    expect(matchingResults).toHaveLength(0);
  });
});
