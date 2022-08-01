import { runOptic, setupWorkspace, fileExists } from './integration';
import path from 'node:path';

jest.setTimeout(30000);

describe('init', () => {
  test('basic init', async () => {
    const workspace = await setupWorkspace('init/basic');

    expect(await fileExists(path.join(workspace, 'optic.yml'))).toBe(false);
    const { combined, code } = await runOptic(workspace, 'init', false);
    expect(await fileExists(path.join(workspace, 'optic.yml'))).toBe(true);
    expect(combined.replace(workspace, '$$workspace$$')).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('init with existing optic.yml', async () => {
    const workspace = await setupWorkspace('init/existing');

    const { combined, code } = await runOptic(workspace, 'init', false);
    expect(combined.replace(workspace, '$$workspace$$')).toMatchSnapshot();
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
      'init --ci github-action',
      false
    );
    expect(await fileExists(actionFilePath)).toBe(true);
    expect(combined.replace(workspace, '$$workspace$$')).toMatchSnapshot();
    expect(code).toBe(0);
  });
});
