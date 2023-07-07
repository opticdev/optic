import { jest, test, expect, describe } from '@jest/globals';
import path from 'path';
import { downloadRuleset } from '../download-ruleset';
import { prepareRulesets } from '../prepare-rulesets';
import { Ruleset } from '../../index';

jest.mock('../download-ruleset');
const downloadRulesetMock = downloadRuleset as jest.MockedFunction<
  typeof downloadRuleset
>;

describe('prepareRulesets', () => {
  test('basic usage', async () => {
    downloadRulesetMock.mockResolvedValue(
      path.join(__dirname, 'mocks', 'fake-custom-ruleset')
    );
    const localRulesetPath = path.join(
      __dirname,
      'mocks',
      'local-fake-custom-ruleset.ts'
    );

    const result = await prepareRulesets({
      ruleset: [
        { name: 'breaking-changes', config: {} },
        { name: '@team/custom-ruleset', config: { required_on: 'always' } },
        { name: localRulesetPath, config: { required_on: 'always' } },
        { name: 'missing-ruleset', config: {} },
      ],
      hostedRulesets: {
        '@team/custom-ruleset': {
          url: 'https://some-url.com',
          uploaded_at: '123',
        },
      },
      standardRulesets: {
        'breaking-changes': {
          fromOpticConfig: (() =>
            new Ruleset({
              name: 'asd',
              rules: [],
            })) as any,
        },
      },
      localRulesets: {
        [localRulesetPath]: localRulesetPath,
      },
    });

    expect(result.rulesets.length).toBe(3);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings).toContain('Ruleset missing-ruleset does not exist');
  });

  test('invalid config', async () => {
    downloadRulesetMock.mockResolvedValue(
      path.join(__dirname, 'mocks', 'fake-custom-ruleset')
    );

    const payload = {
      ruleset: [
        { name: 'breaking-changes', config: {} },
        {
          name: '@team/custom-ruleset',
          config: { required_on: 'some invalid value' },
        },
        { name: 'missing-ruleset', config: {} },
      ],
      hostedRulesets: {
        '@team/custom-ruleset': {
          url: 'https://some-url.com',
          uploaded_at: '123',
        },
      },
      standardRulesets: {
        'breaking-changes': {
          fromOpticConfig: (() =>
            new Ruleset({
              name: 'asd',
              rules: [],
            })) as any,
        },
      },
      localRulesets: {},
    };

    const result = await prepareRulesets(payload);

    expect(result.rulesets.length).toBe(1);
    expect(result.warnings.length).toBe(2);
    expect(result.warnings).toContain('Ruleset missing-ruleset does not exist');
    expect(result.warnings).toContain(
      'Ruleset @team/custom-ruleset had configuration errors:\ndata/required_on must be equal to one of the allowed values'
    );
  });
});
