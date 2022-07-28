import { runOptic, setupWorkspace } from './integration';

jest.setTimeout(30000);

describe('diff', () => {
  test('two files, no repo or config', async () => {
    const workspace = await setupWorkspace('diff/files-no-repo');
    const { combined, code } = await runOptic(
      workspace,
      'diff example-api-v0.json example-api-v1.json',
      false
    );
    expect(combined.replace(workspace, '$$workspace$$')).toMatchSnapshot();
    expect(code).toBe(0);
  });
});
