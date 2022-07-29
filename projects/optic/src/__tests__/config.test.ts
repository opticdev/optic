import { UserError } from '@useoptic/openapi-utilities';
import {
  detectCliConfig,
  formatRules,
  OpticCliConfig,
  validateConfig,
  RawYmlConfig,
} from '../config';

describe('detectConfig', () => {
  test('finds config', async () => {
    const path = await detectCliConfig('src/__tests__/');
    expect(path).toBe('src/__tests__/optic.yml');
  });

  test("doesn't find config", async () => {
    const path = await detectCliConfig('src');
    expect(path).toBeUndefined();
  });
});

describe('validateConfig', () => {
  test('success', () => {
    const config = {};
    expect(() => validateConfig(config, 'somePath')).not.toThrow();
  });

  describe('files', () => {
    test('not array is invalid', () => {
      const config = { files: { foo: 'bar' } };
      expect(() => validateConfig(config, 'somePath')).toThrow(UserError);
    });
  });

  describe('rulesets', () => {
    test('not array is invalid', () => {
      const config = { ruleset: { foo: 'bar' } };
      expect(() => validateConfig(config, 'somePath')).toThrow(UserError);
    });

    test('string is valid', () => {
      const config = { ruleset: ['foo'] };
      expect(() => validateConfig(config, 'somePath')).not.toThrow();
    });

    test('object is valid', () => {
      const config = {
        ruleset: [{ foo: { someOption: true } }],
      };
      expect(() => validateConfig(config, 'somePath')).not.toThrow();
    });

    test('object with invalid config', () => {
      const config = {
        ruleset: [{ foo: 'foo', options: 'yeah' }],
      };
      expect(() => validateConfig(config, 'somePath')).toThrow(UserError);
    });
  });
});

describe('formatRules', () => {
  test('empty ruleset', () => {
    const config: RawYmlConfig = { root: '', files: [] };
    formatRules(config);

    expect(config.ruleset).toEqual([]);
  });

  test('valid rules', () => {
    const config: RawYmlConfig = {
      root: '',
      files: [],
      ruleset: ['some-rule', { 'complex-rule': { withConfig: true } }],
    };

    formatRules(config);
    expect(config.ruleset?.length).toBe(2);
    expect(config.ruleset?.[0]).toEqual({ name: 'some-rule', config: {} });
    expect(config.ruleset?.[1]).toEqual({
      name: 'complex-rule',
      config: { withConfig: true },
    });
  });

  test('empty rule', () => {
    const config: RawYmlConfig = {
      root: '',
      files: [],
      ruleset: [{}],
    };

    expect(() => formatRules(config)).toThrow(UserError);
  });
});
