import {
  test,
  expect,
  describe,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import {
  runOptic,
  setupWorkspace,
  normalizeWorkspace,
  setupTestServer,
} from './integration';
jest.setTimeout(30000);

setupTestServer(({ url, method }) => {
  if (method === 'POST' && /\/api\/organizations\/.*\/rulesets$/.test(url)) {
    return JSON.stringify({
      id: '123',
      slug: '@orgslug/ruleset-name',
      upload_url: `${process.env.BWTS_HOST_OVERRIDE}/upload-url`,
      ruleset_url: 'http://app.useoptic.com/ruleset_url',
    });
  }
  return JSON.stringify({});
});

describe('optic ruleset upload', () => {
  let oldEnv: any;
  beforeEach(() => {
    oldEnv = { ...process.env };
    process.env.LOG_LEVEL = 'info';
  });

  afterEach(() => {
    process.env = { ...oldEnv };
  });

  test('can publish a ruleset', async () => {
    const workspace = await setupWorkspace('ruleset-publish/valid-js-file');
    process.env.OPTIC_TOKEN = '123';
    const { combined, code } = await runOptic(
      workspace,
      'ruleset upload ./rules.js --organization-id 123'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('exits if ruleset file does not have rulesConstructor', async () => {
    const workspace = await setupWorkspace(
      'ruleset-publish/no-rulesConstructor'
    );
    process.env.OPTIC_TOKEN = '123';
    const { combined, code } = await runOptic(
      workspace,
      'ruleset upload ./rules.js --organization-id 123'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });

  test('exits if ruleset file shape is not valid', async () => {
    const workspace = await setupWorkspace('ruleset-publish/invalid-js-file');
    process.env.OPTIC_TOKEN = '123';
    const { combined, code } = await runOptic(
      workspace,
      'ruleset upload ./rules.js --organization-id 123'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });
});
