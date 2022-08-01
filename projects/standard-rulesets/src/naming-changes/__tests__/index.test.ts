import { NamingChangesRuleset } from '..';

describe('fromOpticConfig', () => {
  test('valid', () => {
    const ruleset = NamingChangesRuleset.fromOpticConfig({
      applies: 'always',
      properties: 'snake_case',
    });
    expect(ruleset).toBeInstanceOf(NamingChangesRuleset);
  });
});
