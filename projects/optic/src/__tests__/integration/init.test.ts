import { runOptic, setupWorkspace, fileExists } from './integration';
import path from 'node:path';

jest.setTimeout(10000);

describe('init', () => {
  test('basic init', async () => {
    const workspace = await setupWorkspace(
      path.join(__dirname, 'workspaces', 'init-basic')
    );

    expect(await fileExists(path.join(workspace, 'optic.yml'))).toBe(false);
    const { combined } = await runOptic(workspace, 'init', false);
    expect(await fileExists(path.join(workspace, 'optic.yml'))).toBe(true);
    expect(combined.replace(workspace, '$$workspace$$')).toMatchSnapshot();
  });

  test('init with existing optic.yml', async () => {
    const workspace = await setupWorkspace(
      path.join(__dirname, 'workspaces', 'init-existing')
    );

    const { combined } = await runOptic(workspace, 'init', false);
    expect(combined.replace(workspace, '$$workspace$$')).toMatchSnapshot();
  });
});
