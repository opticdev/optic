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
  if (method === 'POST' && /\/api\/specs\/prepare$/.test(url)) {
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

describe('diff-all', () => {
  let oldEnv: any;
  beforeEach(() => {
    oldEnv = { ...process.env };
    process.env.LOG_LEVEL = 'info';
    process.env.OPTIC_ENV = 'local';
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
    process.env.OPTIC_TOKEN = '123';

    const { combined, code } = await runOptic(workspace, 'diff-all --check');

    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });

  test('diffs all files with --json', async () => {
    const workspace = await setupWorkspace('diff-all/repo', {
      repo: true,
      commit: true,
    });

    await run(
      `mv ./mvspec.yml ./movedspec.yml && git add . && git commit -m 'move spec'`,
      false,
      workspace
    );
    process.env.OPTIC_TOKEN = '123';

    const { combined, code } = await runOptic(
      workspace,
      'diff-all --check --json'
    );

    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });
});
