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
  run,
} from './integration';

jest.setTimeout(30000);

function sanitizeOutput(out: string) {
  return out
    .replace(/tree\/[a-zA-Z0-9]{40}/g, 'tree/COMMIT-HASH')
    .replace(
      /Found last change at [a-zA-Z0-9]{40}/g,
      'Found last change at COMMIT-HASH'
    );
}

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

  test("file doesn't exist", async () => {
    const workspace = await setupWorkspace('diff/files-no-repo', {
      repo: true,
      commit: true,
    });

    await run(
      `touch abc.txt && git add . && git commit -m 'add abc.txt'`,
      false,
      workspace
    );

    const { combined, code } = await runOptic(
      workspace,
      'diff doesnt-exist.json --base HEAD~1'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
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

  test('petstore diff', async () => {
    const workspace = await setupWorkspace('diff/petstore', {
      repo: true,
      commit: true,
    });
    const { combined, code } = await runOptic(
      workspace,
      'diff petstore-base.json petstore-updated.json --check --standard ./ruleset.yml'
    );

    expect(code).toBe(1);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });

  test('with --json arg', async () => {
    const workspace = await setupWorkspace('diff/petstore', {
      repo: true,
      commit: true,
    });
    const { combined, code } = await runOptic(
      workspace,
      'diff petstore-base.json petstore-updated.json --check --json --standard ./ruleset.yml'
    );

    expect(code).toBe(1);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });

  test('with --last-change arg', async () => {
    const workspace = await setupWorkspace('diff/with-last-change-arg', {
      repo: true,
      commit: true,
    });

    await run(
      `sed -i.bak 's/hello/goodbye/' example-api.json example-api.json  && git add . && git commit -m 'change spec'`,
      false,
      workspace
    );

    const { combined, code } = await runOptic(
      workspace,
      'diff example-api.json --last-change --check'
    );

    expect(code).toBe(0);
    expect(
      normalizeWorkspace(workspace, sanitizeOutput(combined))
    ).toMatchSnapshot();
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
});
