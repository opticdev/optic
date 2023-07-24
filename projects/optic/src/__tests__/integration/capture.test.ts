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

jest.setTimeout(50000);

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

async function setPortInFile(workspace: string, file: string) {
  // Set the port in the optic yml for an available port
  await run(`sed -i.bak 's/%PORT/${port}/' ${file} ${file}`, false, workspace);
}

describe('capture with requests', () => {
  describe('verify behavior', () => {
    test('verifies the specification with coverage', async () => {
      const workspace = await setupWorkspace('capture/with-server');
      await setPortInFile(workspace, 'optic.yml');

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
      await setPortInFile(workspace, 'optic.yml');

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
      await setPortInFile(workspace, 'optic.yml');

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
      await setPortInFile(workspace, 'optic.yml');

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
      process.env.SERVER_PREFIX = '/api';
      const workspace = await setupWorkspace('capture/with-server');
      await setPortInFile(workspace, 'optic.yml');
      await setPortInFile(workspace, 'openapi-with-server-prefix.yml');

      const { combined, code } = await runOptic(
        workspace,
        'capture openapi-with-server-prefix.yml --update automatic'
      );
      expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
      expect(code).toBe(0);
      expect(
        await fs.readFile(
          path.join(workspace, 'openapi-with-server-prefix.yml'),
          'utf-8'
        )
      ).toMatchSnapshot();
    });

    test('handles update in other file', async () => {
      const workspace = await setupWorkspace('capture/with-server');
      await setPortInFile(workspace, 'optic.yml');

      const { combined, code } = await runOptic(
        workspace,
        'capture openapi-with-external-ref.yml --update'
      );
      expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
      expect(code).toBe(0);
      expect(
        await fs.readFile(
          path.join(workspace, 'openapi-with-external-ref.yml'),
          'utf-8'
        )
      ).toMatchSnapshot();
      expect(
        await fs.readFile(
          path.join(workspace, './components/books.yml'),
          'utf-8'
        )
      ).toMatchSnapshot();
    });
  });
});
