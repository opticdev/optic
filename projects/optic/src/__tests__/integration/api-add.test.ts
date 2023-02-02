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
  if (method === 'POST' && /\/api\/specs\/prepare$/.test(url)) {
    return JSON.stringify({
      upload_id: '123',
      spec_url: `${process.env.BWTS_HOST_OVERRIDE}/special-s3-route/spec`,
      sourcemap_url: `${process.env.BWTS_HOST_OVERRIDE}/special-s3-route/sourcemap`,
    });
  } else if (method === 'POST' && /\/api\/specs$/.test(url)) {
    return JSON.stringify({
      id: 'spec-id',
    });
  } else if (method === 'GET' && /\/api\/token\/orgs/.test(url)) {
    return JSON.stringify({
      organizations: [{ id: 'org-id', name: 'org-blah' }],
    });
  } else if (method === 'GET' && /\/api\/ruleset-configs/.test(url)) {
    // a return value means it exists
    return JSON.stringify({});
  } else if (method === 'POST' && /\/api\/api/.test(url)) {
    return JSON.stringify({ id: 'api-id' });
  }

  return JSON.stringify({});
});

describe('optic api add', () => {
  let oldEnv: any;
  beforeEach(() => {
    oldEnv = { ...process.env };
    process.env.LOG_LEVEL = 'info';
    process.env.OPTIC_ENV = 'test';
  });

  afterEach(() => {
    process.env = { ...oldEnv };
  });

  describe.each([
    [
      'git',
      {
        repo: true,
        commit: true,
      },
    ],
    [
      'no vcs',
      {
        repo: true, // To force a no vcs - we need to init an empty git repo (otherwise it uses the optic git repo)
        commit: false,
      },
    ],
  ])('%s - no cli interaction', (vcs, setupOptions) => {
    test('discover one file with history depth', async () => {
      process.env.OPTIC_TOKEN = 'something';
      const workspace = await setupWorkspace('api-add/one-file', setupOptions);
      if (vcs === 'git') {
        // add another commit
        await run(
          `touch ./hello.yml && git add . && git commit -m 'another one'`,
          false,
          workspace
        );
      }
      const { combined, code } = await runOptic(
        workspace,
        'api add ./spec.yml'
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

      const workspace = await setupWorkspace(
        'api-add/many-files',
        setupOptions
      );

      const { combined, code } = await runOptic(workspace, 'api add --all');

      expect(code).toBe(0);
      expect(
        normalizeWorkspace(workspace, sanitizeOutput(combined))
      ).toMatchSnapshot();
    });
  });
});
