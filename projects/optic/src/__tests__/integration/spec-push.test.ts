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
      upload_id: '123',
      spec_url: `${process.env.BWTS_HOST_OVERRIDE}/special-s3-route/spec`,
      sourcemap_url: `${process.env.BWTS_HOST_OVERRIDE}/special-s3-route/sourcemap`,
    });
  } else if (method === 'POST' && /\/api\/specs$/.test(url)) {
    return JSON.stringify({
      id: 'spec-id',
    });
  }

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
    process.env.OPTIC_ENV = 'local';
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
});
