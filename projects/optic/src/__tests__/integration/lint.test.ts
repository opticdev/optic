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
  process.env.CI = '';
});

afterEach(() => {
  process.env = { ...oldEnv };
});

describe('lint', () => {
  test('fails on validation errors', async () => {
    const workspace = await setupWorkspace('lint/specs');
    const { combined, code } = await runOptic(
      workspace,
      'lint spec-fails-validation.yml'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });

  test('fails on requirement rule errors', async () => {
    const workspace = await setupWorkspace('lint/specs');
    const { combined, code } = await runOptic(
      workspace,
      'lint spec-fails-requirement.yml'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });

  test('fails on bad formatting', async () => {
    const workspace = await setupWorkspace('lint/specs');
    const { combined, code } = await runOptic(
      workspace,
      'lint spec-with-bad-formatting.yml'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });

  test('passes on valid specs', async () => {
    const workspace = await setupWorkspace('lint/specs');
    const { combined, code } = await runOptic(
      workspace,
      'lint spec-good-spec.yml'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });
});
