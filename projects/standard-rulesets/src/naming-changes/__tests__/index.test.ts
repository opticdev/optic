import { test, expect, describe } from '@jest/globals';
import { NamingChangesRuleset } from '..';

describe('fromOpticConfig', () => {
  test('valid', async () => {
    const ruleset = await NamingChangesRuleset.fromOpticConfig({
      required_on: 'always',
      properties: 'snake_case',
    });
    expect(ruleset).toBeInstanceOf(NamingChangesRuleset);
  });
});
