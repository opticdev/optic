import { jest, describe, test, expect } from '@jest/globals';
import {
  runOptic,
  setupWorkspace,
  normalizeWorkspace,
  run,
} from './integration';
jest.setTimeout(30000);

const date = new Date('2023-01-01');

describe('optic history', () => {
  test('writes changelog', async () => {
    process.env.OPTIC_TOKEN = 'something';
    const workspace = await setupWorkspace('history/petstore', {
      repo: true,
      commit: true,
    });
    const commitDateChanged = formatDateForGitCommit(date);

    const command = `
cp petstore-updated.json petstore-base.json &&\
git add . &&\
GIT_COMMITTER_DATE="${commitDateChanged}" git commit -m 'update petstore' &&\
mv petstore-base.json petstore-base-renamed.json &&\
git add . &&\
GIT_COMMITTER_DATE="${commitDateChanged}" git commit -m 'rename petstore' &&\
touch abc.def && git add . &&\
GIT_COMMITTER_DATE="${formatDateForGitCommit(
      new Date('2023-01-02')
    )}" git commit -m 'empty-commit'
`;

    await run(command, false, workspace);

    const { combined, code } = await runOptic(
      workspace,
      'history petstore-base-renamed.json'
    );

    expect(code).toBe(0);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });

  test('no changes', async () => {
    const workspace = await setupWorkspace('history/petstore', {
      repo: true,
      commit: true,
    });

    const { combined, code } = await runOptic(
      workspace,
      'history petstore-updated.json'
    );

    expect(code).toBe(0);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });
});

function formatDateForGitCommit(date: Date) {
  const year = date.getUTCFullYear();
  const month = padZero(date.getUTCMonth() + 1);
  const day = padZero(date.getUTCDate());
  const hours = padZero(date.getUTCHours());
  const minutes = padZero(date.getUTCMinutes());
  const seconds = padZero(date.getUTCSeconds());
  const offset = getTimezoneOffset(date.getTimezoneOffset());

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${offset}`;
}

function padZero(value: number) {
  return value.toString().padStart(2, '0');
}

function getTimezoneOffset(offset: number) {
  const sign = offset > 0 ? '-' : '+';
  const absOffset = Math.abs(offset);
  const hours = padZero(Math.floor(absOffset / 60));
  const minutes = padZero(absOffset % 60);

  return `${sign}${hours}${minutes}`;
}
