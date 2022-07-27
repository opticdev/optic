import { runOptic, setupWorkspace, fileExists } from './integration';
import path from 'node:path';

jest.setTimeout(10000);

describe('init', () => {
  test('basic init', async () => {
    const workspace = await setupWorkspace(
      path.join(__dirname, 'workspaces', 'basic-init')
    );

    expect(await fileExists(path.join(workspace, 'optic.yml'))).toBe(false);
    await runOptic(workspace, 'init', false);
    expect(await fileExists(path.join(workspace, 'optic.yml'))).toBe(true);
  });
});
