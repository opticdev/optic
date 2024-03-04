import { it, describe, expect } from '@jest/globals';
import { diffOperationWithSpec } from '.';
import { HttpMethods } from '..';
import { OpenAPIV3 } from '../../specs';
import { OperationDiffResultKind } from '../../../capture/patches/patchers/spec/types';

describe('diffOperationWithSpec', () => {
  it('yields diffs for unmatched paths', () => {
    let testSpec: any = {
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

  it('yields diffs for paths with no methods', () => {
    let testSpec: any = {
      openapi: '3.0.3',
      info: {
        title: 'test spec',
        version: '1.0.0',
      },
      paths: {
        '/orders/{orderId}/products': {},
      },
    };

    const unmatchingPathResults = [
      ...diffOperationWithSpec(
        {
          pathPattern: '/orders/{orderId}/products',
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
    let testSpec: any = {
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

  it('yields diffs for unmatched methods', () => {
    let testSpec: any = {
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

    const unmatchingMethod = [
      ...diffOperationWithSpec(
        {
          pathPattern: '/orders/{orderId}/products',
          methods: [HttpMethods.POST],
        },
        testSpec
      ),
    ];
    expect(unmatchingMethod).toHaveLength(1);
    let [unmatchingMethodResult] = unmatchingMethod;
    expect(unmatchingMethodResult.kind).toBe(
      OperationDiffResultKind.UnmatchedMethod
    );
    expect(unmatchingMethodResult).toMatchSnapshot();

    const multipleUnmatchedResults = [
      ...diffOperationWithSpec(
        {
          pathPattern: '/orders/{orderId}/products',
          methods: [HttpMethods.POST, HttpMethods.PUT],
        },
        testSpec
      ),
    ];
    expect(multipleUnmatchedResults).toHaveLength(2);
    expect(
      multipleUnmatchedResults.every(
        (diff) => diff.kind === OperationDiffResultKind.UnmatchedMethod
      )
    ).toBe(true);
    expect(multipleUnmatchedResults).toMatchSnapshot();

    const partialUnmatchedResults = [
      ...diffOperationWithSpec(
        {
          pathPattern: '/orders/{orderId}/products',
          methods: [HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT],
        },
        testSpec
      ),
    ];
    expect(partialUnmatchedResults).toHaveLength(2);
    expect(partialUnmatchedResults).toEqual(multipleUnmatchedResults);
  });
});
