import {
  test,
  expect,
  describe,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { runOptic, setupWorkspace, normalizeWorkspace } from './integration';
import path from 'node:path';
import fs from 'node:fs/promises';
import yaml from 'js-yaml';

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

describe('update', () => {
  test('updates an empty spec', async () => {
    const workspace = await setupWorkspace('update/empty-spec');
    const { combined, code } = await runOptic(
      workspace,
      'update openapi.yml --har har.har --all'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);

    expect(
      yaml.load(await fs.readFile(path.join(workspace, 'openapi.yml'), 'utf-8'))
    ).toMatchSnapshot();
  });

  test('updates an existing spec', async () => {
    const workspace = await setupWorkspace('update/existing-spec');
    const { combined, code } = await runOptic(
      workspace,
      'update openapi.yml --har har.har --all'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);

    expect(
      yaml.load(await fs.readFile(path.join(workspace, 'openapi.yml'), 'utf-8'))
    ).toMatchSnapshot();
  });

  test('update an existing spec with prefixed server', async () => {
    const workspace = await setupWorkspace('update/prefix-server-spec');
    const { combined, code } = await runOptic(
      workspace,
      'update openapi.yml --har har.har --all'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);

    expect(
      yaml.load(await fs.readFile(path.join(workspace, 'openapi.yml'), 'utf-8'))
    ).toMatchSnapshot();
  });
});
