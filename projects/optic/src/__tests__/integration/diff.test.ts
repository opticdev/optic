import {
  runOptic,
  setupWorkspace,
  run,
  normalizeWorkspace,
} from './integration';

jest.setTimeout(30000);

describe('diff', () => {
  test('two files, no repo or config', async () => {
    const workspace = await setupWorkspace('diff/files-no-repo');
    const { combined, code } = await runOptic(
      workspace,
      'diff example-api-v0.json example-api-v1.json'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('`optic diff` compares against HEAD in repo', async () => {
    const workspace = await setupWorkspace('diff/repo', {
      repo: true,
      commit: true,
    });
    await run(
      'mv example-api-1-updated.json example-api-1.json',
      false,
      workspace
    );
    await run(
      'mv example-api-2-updated.json example-api-2.json',
      false,
      workspace
    );
    const { combined, code } = await runOptic(workspace, 'diff');
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('basic rules config', async () => {
    const workspace = await setupWorkspace('diff/basic-rules');
    const { combined, code } = await runOptic(
      workspace,
      'diff example-api-v0.json example-api-v1.json --check'
    );

    expect(code).toBe(0);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });
});
