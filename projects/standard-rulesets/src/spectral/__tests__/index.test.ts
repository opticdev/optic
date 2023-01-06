import { test, expect, describe } from '@jest/globals';
import * as path from 'path';
import { SpectralRulesets } from '../index';

describe('fromOpticConfig', () => {
  test('valid ruleset files work', async () => {
    const ruleset = SpectralRulesets.fromOpticConfig({
      always: [path.join(__dirname, 'example.yml')],
    });

    expect(ruleset).toBeInstanceOf(SpectralRulesets);
  });

  test('valid urls work', async () => {
    const ruleset = SpectralRulesets.fromOpticConfig({
      always: [
        path.join(
          __dirname,
          'https://github.com/SPSCommerce/sps-api-standards/blob/7e089991fa0abe7b1f78ed35711adbcca70828c7/rulesets/src/naming.ruleset.yml'
        ),
      ],
    });

    expect(ruleset).toBeInstanceOf(SpectralRulesets);
  });

  test('non-existant files fail', async () => {
    const t = async () => {
      await SpectralRulesets.fromOpticConfig({
        always: [path.join(__dirname, 'example-1bd.yml')],
      });
    };
    expect(t()).rejects;
  });
});
