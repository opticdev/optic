import { describe, test, expect } from '@jest/globals';
import {
  runOptic,
  setupWorkspace,
  normalizeWorkspace,
  run,
} from './integration';

function sanitizeOutput(out: string) {
  return out.replace(/[a-zA-Z0-9]{8}:/g, 'COMMIT-HASH:');
}

const date = new Date('2023-01-01');

describe('optic history', () => {
  test('writes changelog', async () => {
    process.env.OPTIC_TOKEN = 'something';
    const workspace = await setupWorkspace('history/petstore', {
      repo: true,
      commit: true,
    });

    await run(
      `cp petstore-updated.json petstore-base.json && git add . && GIT_COMMITTER_DATE="${formatDateForGitCommit(
        date
      )}" git commit -m 'update petstore' `,
      false,
      workspace
    );

    const { combined, code } = await runOptic(
      workspace,
      'history petstore-base.json'
    );

    expect(code).toBe(0);
    expect(
      normalizeWorkspace(workspace, sanitizeOutput(combined))
    ).toMatchSnapshot();
  }, 20000);
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
