import { test, expect, describe } from '@jest/globals';
import { SpectralOasV6Ruleset } from '..';

describe('fromOpticConfig', () => {
  test('valid', () => {
    const ruleset = SpectralOasV6Ruleset.fromOpticConfig({
      applies: 'always',
      rules: {
        'operation-operationId': false,
        'operation-tags': false,
      },
    });
    expect(ruleset).toBeInstanceOf(SpectralOasV6Ruleset);
  });

  test('default settings', () => {
    const ruleset = SpectralOasV6Ruleset.fromOpticConfig({});
    expect(ruleset).toBeInstanceOf(SpectralOasV6Ruleset);
  });

  test('invalid non-existent rule', () => {
    const ruleset = SpectralOasV6Ruleset.fromOpticConfig({
      applies: 'always',
      rules: {
        'operation-2xx-response': 'error',
      },
    });
    expect(ruleset).not.toBeInstanceOf(SpectralOasV6Ruleset);
    expect(ruleset).toMatchSnapshot();
  });

  test('invalid', () => {
    const ruleset = SpectralOasV6Ruleset.fromOpticConfig({
      applies: 'notalways',
    });
    expect(ruleset).not.toBeInstanceOf(SpectralOasV6Ruleset);
    expect(ruleset).toMatchSnapshot();
  });
});
