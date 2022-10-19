import { runOptic, setupWorkspace, normalizeWorkspace } from './integration';

jest.setTimeout(30000);
// TODO replace this with real mocks when connected to backend
jest.mock('node-fetch');

describe('optic ruleset publish', () => {
  let oldEnv: any;
  beforeEach(() => {
    oldEnv = {...process.env}
  })

  afterEach(() => {
    jest.resetAllMocks();
    process.env = {...oldEnv}
  });

  test('can publish a ruleset', async () => {
    const workspace = await setupWorkspace('ruleset-publish/valid-js-file');
    process.env.OPTIC_TOKEN = '123'
    const { combined, code } = await runOptic(
      workspace,
      'ruleset publish ./rules.js'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('can publish uncompressable ruleset', async () => {
    const workspace = await setupWorkspace('ruleset-publish/uncompressed-file');
    process.env.OPTIC_TOKEN = '123'
    const { combined, code } = await runOptic(
      workspace,
      'ruleset publish ./rules.js'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('exits if ruleset file shape is not valid', async () => {
    const workspace = await setupWorkspace('ruleset-publish/invalid-js-file');
    process.env.OPTIC_TOKEN = '123'
    const { combined, code } = await runOptic(
      workspace,
      'ruleset publish ./rules.js'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });
});
