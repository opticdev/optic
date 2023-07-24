import {
  test,
  expect,
  describe,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import {
  runOptic,
  setupWorkspace,
  normalizeWorkspace,
  run,
} from './integration';
import portfinder from 'portfinder';

jest.setTimeout(30000);

let oldEnv: any;
let port: string;
beforeEach(async () => {
  oldEnv = { ...process.env };
  process.env.LOG_LEVEL = 'info';
  process.env.OPTIC_ENV = 'local';
  port = String(await portfinder.getPortPromise());
  process.env.PORT = port;
});

afterEach(() => {
  process.env = { ...oldEnv };
});

describe('capture', () => {
  describe('verify behavior', () => {
    test('verifies the specification with coverage', async () => {
      const workspace = await setupWorkspace('capture/with-server');
      // Set the port in the optic yml for an available port
      await run(
        `sed -i.bak 's/%PORT/${port}/' optic.yml optic.yml`,
        false,
        workspace
      );

      const { combined, code } = await runOptic(
        workspace,
        'capture openapi.yml'
      );
      expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
      expect(code).toBe(1);
    });
  });

  describe('update behavior', () => {
    test('updates only existing endpoints by default', () => {});

    test('updates all endpoints with --update automatic', () => {});

    test('respects x-optic-path-ignore', () => {});

    test('handle server path prefixes in spec', () => {
      process.env.SERVER_PREFIX = '/a-prefix';
    });
  });
});
