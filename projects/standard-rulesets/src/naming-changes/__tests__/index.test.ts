import { test, expect, describe } from '@jest/globals';
import { NamingChangesRuleset } from '..';

describe('fromOpticConfig', () => {
  test('valid', () => {
    const ruleset = NamingChangesRuleset.fromOpticConfig({
      required_on: 'always',
      properties: 'snake_case',
    });
    expect(ruleset).toBeInstanceOf(NamingChangesRuleset);
  });
});
