import { it, describe, expect } from '@jest/globals';
import { visitMethod } from './method';
import { OpenAPIV3 } from '../../../specs';
import { Some, None } from 'ts-results';

describe('visitMethod', () => {
  it('detects an unspecified path', () => {
    const operation: OpenAPIV3.OperationObject = {
      responses: {},
    };

    const matchingResults = [
      ...visitMethod(OpenAPIV3.HttpMethods.GET, Some(operation), {
        pathPattern: '/orders/{orderId}',
      }),
    ];
    expect(matchingResults).toHaveLength(0);

    const unmatchingResults = [
      ...visitMethod(OpenAPIV3.HttpMethods.GET, None, {
        pathPattern: '/orders/{orderId}',
      }),
    ];
    expect(unmatchingResults).toHaveLength(1);
    expect(unmatchingResults).toMatchSnapshot();
  });
});
