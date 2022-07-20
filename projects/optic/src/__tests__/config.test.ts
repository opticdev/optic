import { UserError } from '@useoptic/openapi-utilities';
import { detectCliConfig, validateConfig } from '../config';

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

  describe('rules', () => {
    test('not array is invalid', () => {
      const config = { rules: { foo: 'bar' } };
      expect(() => validateConfig(config, 'somePath')).toThrow(UserError);
    });

    test('string is valid', () => {
      const config = { rules: ['foo'] };
      expect(() => validateConfig(config, 'somePath')).not.toThrow();
    });

    test('object is valid', () => {
      const config = {
        rules: [{ foo: { someOption: true } }],
      };
      expect(() => validateConfig(config, 'somePath')).not.toThrow();
    });

    test('object with invalid config', () => {
      const config = {
        rules: [{ foo: 'foo', options: 'yeah' }],
      };
      expect(() => validateConfig(config, 'somePath')).toThrow(UserError);
    });
  });
});
