import { runOptic, setupWorkspace, normalizeWorkspace } from './integration';

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

  test('basic rules config', async () => {
    const workspace = await setupWorkspace('diff/basic-rules');
    const { combined, code } = await runOptic(
      workspace,
      'diff example-api-v0.json example-api-v1.json --check'
    );

    expect(code).toBe(1);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });

  test('breaking changes exclusion', async () => {
    const workspace = await setupWorkspace('diff/breaking-changes-exclusion');
    const { combined, code } = await runOptic(
      workspace,
      'diff example-api-v0.json example-api-v1.json --check'
    );

    expect(code).toBe(0);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });

  test('basic rules config', async () => {
    const workspace = await setupWorkspace('diff/basic-rules-dev-yml');
    const { combined, code } = await runOptic(
      workspace,
      'diff example-api-v0.json example-api-v1.json --check'
    );

    expect(code).toBe(1);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });

  test('breaking changes exclusion', async () => {
    const workspace = await setupWorkspace(
      'diff/breaking-changes-exclusion-dev-yml'
    );
    const { combined, code } = await runOptic(
      workspace,
      'diff example-api-v0.json example-api-v1.json --check'
    );

    expect(code).toBe(0);
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
  });
});
