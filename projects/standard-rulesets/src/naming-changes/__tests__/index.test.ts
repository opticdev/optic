import { test, expect, describe } from '@jest/globals';
import { NamingChangesRuleset } from '..';

describe('fromOpticConfig', () => {
  test('valid', async () => {
    const ruleset = await NamingChangesRuleset.fromOpticConfig({
      required_on: 'always',
      properties: 'snake_case',
      exclude_operations_with_extension: 'x-legacy',
      docs_link: 'asdasd.com',
      severity: 'warn',
    });
    expect(ruleset).toBeInstanceOf(NamingChangesRuleset);
  });
});
