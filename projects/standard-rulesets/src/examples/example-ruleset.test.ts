import { test, expect, describe } from '@jest/globals';
import { ExamplesRuleset } from '../index';

describe('fromOpticConfig', () => {
  test('invalid configuration', async () => {
    const out = await ExamplesRuleset.fromOpticConfig({
      require_parameter_examples: 123,
    });
    expect(out).toEqual(
      '- ruleset/examples/require_parameter_examples must be boolean'
    );
  });

  test('valid config', async () => {
    const ruleset = await ExamplesRuleset.fromOpticConfig({
      require_parameter_examples: true,
      exclude_operations_with_extension: 'x-legacy',
      docs_link: 'asdasd.com',
    });
    expect(ruleset).toBeInstanceOf(ExamplesRuleset);
  });
});
