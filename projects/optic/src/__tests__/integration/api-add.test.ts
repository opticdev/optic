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

function sanitizeOutput(out: string) {
  return out.replace(/[a-zA-Z0-9]{8}:/g, 'COMMIT-HASH:');
}

setupTestServer(({ url, method }) => {
  return JSON.stringify({});
});

describe('optic api add', () => {
  let oldEnv: any;
  beforeEach(() => {
    oldEnv = { ...process.env };
    process.env.LOG_LEVEL = 'info';
  });

  afterEach(() => {
    process.env = { ...oldEnv };
  });

  describe('no interaction', () => {
    // TODO when connecting API, force to only return one org
    test('discover one file with history depth', async () => {
      process.env.OPTIC_TOKEN = 'something';
      const workspace = await setupWorkspace('api-add/one-file', {
        repo: true,
        commit: true,
      });
      // add another commit
      await run(
        `touch ./hello.yml && git add . && git commit -m 'another one'`,
        false,
        workspace
      );
      const { combined, code } = await runOptic(
        workspace,
        'api add ./spec.yml --standard blah'
      );

      expect(code).toBe(0);
      expect(
        normalizeWorkspace(workspace, sanitizeOutput(combined))
      ).toMatchSnapshot();
      // expect spec to have added yml files
      const { code: specCode, combined: specCombined } = await run(
        'cat ./spec.yml',
        false,
        workspace
      );
      expect(specCode).toBe(0);
      expect(normalizeWorkspace(workspace, specCombined)).toMatchSnapshot();
    });

    test('discover all files in repo', async () => {
      process.env.OPTIC_TOKEN = 'something';

      const workspace = await setupWorkspace('api-add/many-files', {
        repo: true,
        commit: true,
      });

      const { combined, code } = await runOptic(
        workspace,
        'api add --standard blah'
      );

      expect(code).toBe(0);
      expect(
        normalizeWorkspace(workspace, sanitizeOutput(combined))
      ).toMatchSnapshot();
    });
  });
});
