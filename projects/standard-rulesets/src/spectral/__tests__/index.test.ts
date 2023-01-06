import { test, expect, describe } from '@jest/globals';
import * as path from 'path';
import { SpectralRulesets } from '../index';

describe('fromOpticConfig', () => {
  test('valid ruleset files work', async () => {
    const ruleset = await SpectralRulesets.fromOpticConfig({
      always: [path.join(__dirname, 'example.yml')],
    });

    expect(ruleset).toBeInstanceOf(SpectralRulesets);
  });

  test('invalid ruleset files fail', () => {
    const load = async () => {
      await SpectralRulesets.fromOpticConfig({
        always: [path.join(__dirname, 'example-abc.yml')],
      });
    };

    expect(load()).rejects;
  });

  test('valid urls work', async () => {
    const ruleset = await SpectralRulesets.fromOpticConfig({
      always: [
        'https://raw.githubusercontent.com/SPSCommerce/sps-api-standards/7e089991fa0abe7b1f78ed35711adbcca70828c7/rulesets/src/naming.ruleset.yml',
      ],
    });

    expect(ruleset).toBeInstanceOf(SpectralRulesets);
  });
});
