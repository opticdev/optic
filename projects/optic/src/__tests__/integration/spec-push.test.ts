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
  run,
} from './integration';
jest.setTimeout(30000);

setupTestServer(({ url, method }) => {
  return JSON.stringify({});
});

function sanitizeOutput(out: string) {
  return out.replace(/git:[a-zA-Z0-9]{40}/g, 'git:COMMIT-HASH');
}

describe('optic spec push', () => {
  let oldEnv: any;
  beforeEach(() => {
    oldEnv = { ...process.env };
    process.env.LOG_LEVEL = 'info';
  });

  afterEach(() => {
    process.env = { ...oldEnv };
  });

  test('can push a spec to a repo', async () => {
    const workspace = await setupWorkspace('spec-push/simple', {
      repo: true,
      commit: true,
    });
    process.env.OPTIC_TOKEN = '123';
    const { combined, code } = await runOptic(
      workspace,
      'spec push ./spec.yml --tag env:production,the-favorite-api'
    );
    expect(code).toBe(0);
    expect(
      normalizeWorkspace(workspace, sanitizeOutput(combined))
    ).toMatchSnapshot();
  });

  test('requires x-optic-url', async () => {
    const workspace = await setupWorkspace('spec-push/no-x-optic-url', {
      repo: true,
      commit: true,
    });
    process.env.OPTIC_TOKEN = '123';
    const { combined, code } = await runOptic(
      workspace,
      'spec push ./spec.yml'
    );

    expect(code).toBe(1);
    expect(
      normalizeWorkspace(workspace, sanitizeOutput(combined))
    ).toMatchSnapshot();
  });
});
