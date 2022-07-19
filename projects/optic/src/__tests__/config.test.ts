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

  test('invalid files', () => {
    const config = { files: { foo: 'bar' } };
    expect(() => validateConfig(config, 'somePath')).toThrow(UserError);
  });
});
