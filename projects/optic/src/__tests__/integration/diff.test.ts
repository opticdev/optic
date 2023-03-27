import {
  test,
  expect,
  describe,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import fs from 'node:fs/promises';
import path from 'path';
import {
  runOptic,
  setupWorkspace,
  normalizeWorkspace,
  setupTestServer,
  run,
} from './integration';

jest.setTimeout(30000);

let oldEnv: any;
beforeEach(() => {
  oldEnv = { ...process.env };
  process.env.LOG_LEVEL = 'info';
  process.env.OPTIC_ENV = 'local';
  process.env.CI = 'false';
});

afterEach(() => {
  process.env = { ...oldEnv };
});

describe('diff', () => {
  test('two files, no repo or config', async () => {
    const workspace = await setupWorkspace('diff/files-no-repo', {
      repo: false,
    });
    const { combined, code } = await runOptic(
      workspace,
      'diff example-api-v0.json example-api-v1.json'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('reads optic.dev.yml for rulesets', async () => {
    const workspace = await setupWorkspace('diff/basic-rules-dev-yml', {
      repo: true,
      commit: true,
    });
    const { combined, code } = await runOptic(
      workspace,
      'diff example-api-v0.json example-api-v1.json --check'
    );

    expect(code).toBe(1);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });

  test.only('petstore diff', async () => {
    const workspace = await setupWorkspace('diff/petstore', {
      repo: true,
      commit: true,
    });
    const { combined, code } = await runOptic(
      workspace,
      'diff petstore-base.json petstore-updated.json --check --standard ./ruleset.yml'
    );
    console.log(combined);

    expect(code).toBe(1);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });

  test('with --standard arg', async () => {
    const workspace = await setupWorkspace('diff/with-standard-arg', {
      repo: true,
      commit: true,
    });
    const { combined, code } = await runOptic(
      workspace,
      'diff example-api-v0.json example-api-v1.json --check --standard ./ruleset.yml'
    );

    expect(code).toBe(1);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });

  describe('with mock server', () => {
    setupTestServer(async ({ url, method }) => {
      if (method === 'GET' && /\/api\/rulesets/.test(url)) {
        return JSON.stringify({
          rulesets: [
            {
              name: '@org/custom-ruleset',
              url: `${process.env.BWTS_HOST_OVERRIDE}/download-url`,
              uploaded_at: '2022-11-02T17:55:48.078Z',
            },
          ],
        });
      } else if (method === 'GET' && /download-url/.test(url)) {
        return fs.readFile(
          path.resolve(
            __dirname,
            './workspaces/diff/custom-rules/rules/cloud-mock.js'
          )
        );
      } else if (method === 'GET' && /\/api\/ruleset-configs\//.test(url)) {
        return JSON.stringify({
          organization_id: 'abc',
          config: {
            ruleset: [{ name: 'breaking-changes', config: {} }],
          },
          ruleset_id: 'abc',
          created_at: '2022-11-02T17:55:48.078Z',
          updated_at: '2022-11-02T17:55:48.078Z',
        });
      } else if (method === 'POST' && /\/api\/specs\/prepare$/.test(url)) {
        return JSON.stringify({
          spec_id: 'already-uploaded',
        });
      } else if (method === 'POST' && /\/api\/runs\/prepare$/.test(url)) {
        return JSON.stringify({
          check_results_url: `${process.env.BWTS_HOST_OVERRIDE}/special-s3-route`,
          upload_id: '123',
        });
      } else if (method === 'POST' && /\/api\/runs2$/.test(url)) {
        return JSON.stringify({
          id: 'run-id',
        });
      }
      return JSON.stringify({});
    });

    test('uploads specs if authenticated and --upload', async () => {
      const workspace = await setupWorkspace('diff/upload', {
        repo: true,
        commit: true,
      });

      await run(
        `sed -i.bak 's/string/number/' spec.json spec.json && git add . && git commit -m 'update spec'`,
        false,
        workspace
      );

      process.env.OPTIC_TOKEN = '123';
      process.env.CI = 'true';

      const { combined, code } = await runOptic(
        workspace,
        'diff spec.json --base HEAD~1 --check --upload'
      );

      expect(code).toBe(1);
      expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    });

    test('ruleset key on api spec', async () => {
      const workspace = await setupWorkspace('diff/with-x-optic-standard', {
        repo: true,
        commit: true,
      });
      const { combined, code } = await runOptic(
        workspace,
        'diff example-api-v0.json example-api-v1.json --check'
      );

      expect(code).toBe(1);
      expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    });

    test('custom rules', async () => {
      const workspace = await setupWorkspace('diff/custom-rules', {
        repo: true,
        commit: true,
      });
      const { combined, code } = await runOptic(
        workspace,
        'diff example-api-v0.json example-api-v1.json --check'
      );

      expect(code).toBe(1);
      expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    });

    test('extends', async () => {
      const workspace = await setupWorkspace('diff/extends', {
        repo: true,
        commit: true,
      });
      const { combined, code } = await runOptic(
        workspace,
        'diff example-api-v0.json example-api-v1.json --check'
      );

      expect(code).toBe(1);
      expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    });
  });
});
