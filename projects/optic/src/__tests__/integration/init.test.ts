import {
  runOptic,
  setupWorkspace,
  fileExists,
  normalizeWorkspace,
} from './integration';
import path from 'node:path';
import { OPTIC_DEV_YML_NAME } from '../../config';

jest.setTimeout(30000);

describe('init', () => {
  test('basic init', async () => {
    const workspace = await setupWorkspace('init/basic');

    expect(await fileExists(path.join(workspace, OPTIC_DEV_YML_NAME))).toBe(
      false
    );
    const { combined, code } = await runOptic(workspace, 'init');
    expect(await fileExists(path.join(workspace, OPTIC_DEV_YML_NAME))).toBe(
      true
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('init with existing optic.init.yml', async () => {
    const workspace = await setupWorkspace('init/existing');

    const { combined, code } = await runOptic(workspace, 'init');
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });

  test('init with `--ci github-action` option', async () => {
    const workspace = await setupWorkspace('init/basic');

    const actionFilePath = path.join(
      workspace,
      '.github',
      'workflows',
      'optic-ci.yml'
    );

    expect(await fileExists(actionFilePath)).toBe(false);
    const { combined, code } = await runOptic(
      workspace,
      'init --ci github-action'
    );
    expect(await fileExists(actionFilePath)).toBe(true);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('init with `--ci-only github-action` option', async () => {
    const workspace = await setupWorkspace('init/existing');

    const actionFilePath = path.join(
      workspace,
      '.github',
      'workflows',
      'optic-ci.yml'
    );

    expect(await fileExists(actionFilePath)).toBe(false);
    const { combined, code } = await runOptic(
      workspace,
      'init --ci-only github-action'
    );
    expect(await fileExists(actionFilePath)).toBe(true);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });
});
