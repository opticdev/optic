import { test, expect, describe } from '@jest/globals';
import { SpectralRulesets } from '..';
import * as path from 'path';

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
      const ruleset = SpectralRulesets.fromOpticConfig({
        always: [path.join(__dirname, 'example-1bd.yml')],
      });
      if (ruleset instanceof SpectralRulesets) {
        console.log(await ruleset.preparedRulesets());
      }
    };
    expect(t()).rejects;
  });
});
