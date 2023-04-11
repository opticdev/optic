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
import path from 'node:path';
import fs from 'node:fs/promises';

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
    process.env.CI = 'true';
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

    const { combined, code } = await runOptic(
      workspace,
      'diff-all --check --upload'
    );

    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(
      JSON.parse(
        await fs.readFile(path.join(workspace, 'ci-run-details.json'), 'utf-8')
      )
    ).toMatchSnapshot();
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
      'diff-all --check --json --upload'
    );

    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });

  test('diff all with glob and ignores', async () => {
    const workspace = await setupWorkspace('diff-all/globs', {
      repo: true,
      commit: true,
    });

    await run(
      `mv ./folder-to-run/should-run.yml ./folder-to-run/should-run-mved.yml && git add . && git commit -m 'move spec'`,
      false,
      workspace
    );
    process.env.OPTIC_TOKEN = '123';

    const { combined, code } = await runOptic(
      workspace,
      'diff-all --check --upload --match "folder-to-run/**" --ignore "folder-to-run/ignore/**"'
    );

    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });

  test('diff all not in the root of a repo', async () => {
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
      path.join(workspace, 'folder'),
      'diff-all --check --upload'
    );

    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });
});
