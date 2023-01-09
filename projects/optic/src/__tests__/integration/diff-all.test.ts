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

describe('diff-all', () => {
  let oldEnv: any;
  beforeEach(() => {
    oldEnv = { ...process.env };
    process.env.LOG_LEVEL = 'info';
  });

  afterEach(() => {
    process.env = { ...oldEnv };
  });

  test('diffs all files in an workspace with x-optic-url keys', async () => {
    const workspace = await setupWorkspace('diff-all/repo', {
      repo: true,
      commit: true,
    });

    await run(
      `mv ./mvspec.yml ./movedspec.yml && git add . && git commit -m 'move spec'`,
      false,
      workspace
    );

    const { combined, code } = await runOptic(workspace, 'diff-all --check');

    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });
});
