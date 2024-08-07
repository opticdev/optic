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
  run,
} from './integration';
import path from 'node:path';

jest.setTimeout(30000);

function sanitizeOutput(out: string) {
  return out.replace(/tree\/[a-zA-Z0-9]{40}/g, 'tree/COMMIT-HASH');
}

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

  test('diffs all in an empty folder', async () => {
    const workspace = await setupWorkspace('diff-all/empty', {
      repo: true,
      commit: true,
    });

    await run(
      `touch a.yml && git add . && git commit -m 'add empty file'`,
      false,
      workspace
    );
    const { combined, code } = await runOptic(workspace, 'diff-all --check');

    expect(
      normalizeWorkspace(workspace, sanitizeOutput(combined))
    ).toMatchSnapshot();
    expect(code).toBe(1);
  });

  test('diffs all files in a workspace without --upload', async () => {
    const workspace = await setupWorkspace('diff-all/without-optic-url', {
      repo: true,
      commit: true,
    });

    await run(
      `mv ./mvspec.yml ./movedspec.yml && git add . && git commit -m 'move spec'`,
      false,
      workspace
    );
    const { combined, code } = await runOptic(workspace, 'diff-all --check');

    expect(
      normalizeWorkspace(workspace, sanitizeOutput(combined))
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

    expect(
      normalizeWorkspace(workspace, sanitizeOutput(combined))
    ).toMatchSnapshot();
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

    expect(
      normalizeWorkspace(workspace, sanitizeOutput(combined))
    ).toMatchSnapshot();
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

    expect(
      normalizeWorkspace(workspace, sanitizeOutput(combined))
    ).toMatchSnapshot();
    expect(code).toBe(1);
  });
});
