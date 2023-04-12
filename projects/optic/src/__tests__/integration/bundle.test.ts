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

let oldEnv: any;
beforeEach(() => {
  oldEnv = { ...process.env };
  process.env.LOG_LEVEL = 'info';
  process.env.OPTIC_ENV = 'local';
});

afterEach(() => {
  process.env = { ...oldEnv };
});

describe('bundle', () => {
  test('bundles components together', async () => {
    const workspace = await setupWorkspace('bundle/specs');
    const { combined, code } = await runOptic(workspace, 'bundle openapi.yml');
    console.log(combined);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });
});
