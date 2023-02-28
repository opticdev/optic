import { describe, it, expect } from '@jest/globals';
import { isPathParameterArray } from '../openapi-matchers';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

describe('openapi matchers', () => {
  it('matches parameters array', () => {
    expect(
      isPathParameterArray(
        jsonPointerHelpers.compile(['paths', '/me/them', 'get', 'parameters'])
      )
    ).toBe(true);

    expect(
      isPathParameterArray(
        jsonPointerHelpers.compile([
          'paths',
          '/me/them',
          'summary',
          'parameters',
        ])
      )
    ).toBe(false);
    expect(
      isPathParameterArray(
        jsonPointerHelpers.compile(['paths', '/me/them', 'parameters'])
      )
    ).toBe(true);
    isPathParameterArray(
      jsonPointerHelpers.compile(['paths', '/me/them', 'get', 'responses'])
    );
    expect(
      isPathParameterArray(
        jsonPointerHelpers.compile(['paths', '/me/them', 'parameters'])
      )
    ).toBe(true);
  });
});
