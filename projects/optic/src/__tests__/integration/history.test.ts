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

describe('optic history', () => {
  test('writes changelog', async () => {
    process.env.OPTIC_TOKEN = 'something';
    const workspace = await setupWorkspace('history/petstore', {
      repo: true,
      commit: true,
    });

    await run(
      `cp petstore-updated.json petstore-base.json && git add . && git commit -m 'update petstore'`,
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
