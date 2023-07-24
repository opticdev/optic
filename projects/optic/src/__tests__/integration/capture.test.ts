import path from 'node:path';
import fs from 'node:fs/promises';
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

async function setPortInOpticYml(workspace: string) {
  // Set the port in the optic yml for an available port
  await run(
    `sed -i.bak 's/%PORT/${port}/' optic.yml optic.yml`,
    false,
    workspace
  );
}

describe('capture', () => {
  describe('verify behavior', () => {
    test('verifies the specification with coverage', async () => {
      const workspace = await setupWorkspace('capture/with-server');
      await setPortInOpticYml(workspace);

      const { combined, code } = await runOptic(
        workspace,
        'capture openapi.yml'
      );
      expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
      expect(code).toBe(1);
    });
  });

  describe('update behavior', () => {
    test('updates only existing endpoints by default', async () => {
      const workspace = await setupWorkspace('capture/with-server');
      await setPortInOpticYml(workspace);

      const { combined, code } = await runOptic(
        workspace,
        'capture openapi.yml --update'
      );
      expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
      // Updated, but has unmatched interactions
      expect(code).toBe(1);
      expect(
        await fs.readFile(path.join(workspace, 'openapi.yml'), 'utf-8')
      ).toMatchSnapshot();
    });

    test('updates all endpoints with --update automatic', async () => {
      const workspace = await setupWorkspace('capture/with-server');
      await setPortInOpticYml(workspace);

      const { combined, code } = await runOptic(
        workspace,
        'capture openapi.yml --update automatic'
      );
      expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
      expect(code).toBe(0);
      expect(
        await fs.readFile(path.join(workspace, 'openapi.yml'), 'utf-8')
      ).toMatchSnapshot();
    });

    test('respects x-optic-path-ignore', async () => {
      const workspace = await setupWorkspace('capture/with-server');
      await setPortInOpticYml(workspace);

      const { combined, code } = await runOptic(
        workspace,
        'capture openapi-with-ignore.yml --update automatic'
      );
      expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
      expect(code).toBe(0);
      expect(
        await fs.readFile(
          path.join(workspace, 'openapi-with-ignore.yml'),
          'utf-8'
        )
      ).toMatchSnapshot();
    });

    test('handle server path prefixes in spec', async () => {
      process.env.SERVER_PREFIX = '/a-prefix';
    });

    test('handles update in other file', async () => {});
  });
});
