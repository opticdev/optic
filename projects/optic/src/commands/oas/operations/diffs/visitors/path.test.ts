import { it, describe, expect } from '@jest/globals';
import { visitPath } from './path';
import { Some, None } from 'ts-results';

describe('visitPath', () => {
  it('detects an unspecified path', () => {
    const matchingResults = [
      ...visitPath('/orders/{orderId}', Some({}), {
        pathPattern: Some('/orders/{orderId}'),
      }),
    ];
    expect(matchingResults).toHaveLength(0);

    const unmatchingResults = [
      ...visitPath('/orders/{orderId}', None, { pathPattern: None }),
    ];
    expect(unmatchingResults).toHaveLength(1);
    expect(unmatchingResults).toMatchSnapshot();
  });
});
