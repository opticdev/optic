import {
  test,
  expect,
  describe,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { runOptic, setupWorkspace, normalizeWorkspace } from './integration';
jest.setTimeout(30000);

describe('optic api list', () => {
  let oldEnv: any;
  beforeEach(() => {
    oldEnv = { ...process.env };
    process.env.LOG_LEVEL = 'info';
    process.env.OPTIC_ENV = 'test';
  });

  afterEach(() => {
    process.env = { ...oldEnv };
  });

  test('lists all files in repo', async () => {
    process.env.OPTIC_TOKEN = 'something';

    const workspace = await setupWorkspace('api-list/many-files');

    const { combined, code } = await runOptic(workspace, 'api list');

    expect(code).toBe(0);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });
});
