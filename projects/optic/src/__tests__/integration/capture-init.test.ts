import {
  test,
  expect,
  describe,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import fs from 'node:fs/promises';
import path from 'path';
import { runOptic, setupWorkspace, normalizeWorkspace } from './integration';

jest.setTimeout(30000);

let oldEnv: any;
beforeEach(() => {
  oldEnv = { ...process.env };
  process.env.LOG_LEVEL = 'info';
  process.env.OPTIC_ENV = 'local';
  process.env.CI = 'false';
});

afterEach(() => {
  process.env = { ...oldEnv };
});

describe('capture init', () => {
  test('init with no optic.yml', async () => {
    const workspace = await setupWorkspace('capture-init/no-yml', {
      repo: true,
    });
    const { combined, code } = await runOptic(
      workspace,
      'capture init abc.yml'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
    expect(
      await fs.readFile(path.join(workspace, 'optic.yml'), 'utf-8')
    ).toMatchSnapshot();
  });

  test('init with windows path is normalized', async () => {
    const workspace = await setupWorkspace('capture-init/no-yml', {
      repo: true,
    });
    const { combined, code } = await runOptic(
      workspace,
      String.raw`capture init test\\abc.yml`
    );
    expect(
      await fs.readFile(path.join(workspace, 'optic.yml'), 'utf-8')
    ).toMatch(/test\/abc\.yml/);
  });

  test('init with existing optic.yml', async () => {
    const workspace = await setupWorkspace('capture-init/yml', {
      repo: true,
    });
    const { combined, code } = await runOptic(
      workspace,
      'capture init abc.yml'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
    expect(
      await fs.readFile(path.join(workspace, 'optic.yml'), 'utf-8')
    ).toMatchSnapshot();
  });

  test('init with --stdout', async () => {
    const workspace = await setupWorkspace('capture-init/no-yml', {
      repo: true,
    });
    const { combined, code } = await runOptic(
      workspace,
      'capture init abc.yml --stdout'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });
});
