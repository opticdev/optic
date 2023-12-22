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
  setupTestServer,
} from './integration';
import portfinder from 'portfinder';

jest.setTimeout(30000);

setupTestServer(({ url, method }) => {
  if (method === 'POST' && /\/api\/specs\/prepare$/.test(url)) {
    return JSON.stringify({
      spec_id: 'already-uploaded',
    });
  } else if (method === 'POST' && /\/api\/runs\/prepare$/.test(url)) {
    return JSON.stringify({
      check_results_url: `${process.env.BWTS_HOST_OVERRIDE}/special-s3-route`,
      upload_id: '123',
    });
  } else if (method === 'POST' && /\/api\/verifications\/prepare$/.test(url)) {
    return JSON.stringify({
      url: `${process.env.BWTS_HOST_OVERRIDE}/special-s3-route`,
      upload_id: '123',
    });
  } else if (method === 'POST' && /\api\/verifications$/.test(url)) {
    return JSON.stringify({
      id: 'verification-id',
    });
  } else if (method === 'POST' && /\/api\/runs2$/.test(url)) {
    return JSON.stringify({
      id: 'run-id',
    });
  } else if (method === 'GET' && /spec$/.test(url)) {
    return `{"openapi":"3.1.0","paths":{ "/api/users": { "get": { "responses":{} }}},"info":{"version":"0.0.0","title":"Empty"}}`;
  } else if (method === 'GET' && /sourcemap$/.test(url)) {
    return `{"rootFilePath":"empty.json","files":[{"path":"empty.json","sha256":"815b8e5491a1f491765084f236c741d5073e10fcece23436f2db84a8c788db09","contents":"{'openapi':'3.1.0','paths':{ '/api/users': { 'get': { 'responses':{} }}},'info':{'version':'0.0.0','title':'Empty'}}","index":0}],"refMappings":{}}`;
  } else if (method === 'GET' && /api\/apis\/.*\/specs\/.*$/.test(url)) {
    return JSON.stringify({
      id: 'run-id',
      specUrl: `${process.env.BWTS_HOST_OVERRIDE}/spec`,
      sourcemapUrl: `${process.env.BWTS_HOST_OVERRIDE}/sourcemap`,
    });
  } else if (method === 'GET' && /\/api\/apis/.test(url)) {
    return JSON.stringify({
      apis: [null],
    });
  } else if (method === 'POST' && /\/api\/api$/.test(url)) {
    return JSON.stringify({
      id: 'generated-api',
    });
  } else if (method === 'GET' && /\/api\/token\/orgs/.test(url)) {
    return JSON.stringify({
      organizations: [{ id: 'org-id', name: 'org-blah' }],
    });
  }
  return JSON.stringify({});
});

let oldEnv: any;
let port: string;
beforeEach(async () => {
  oldEnv = { ...process.env };
  process.env.LOG_LEVEL = 'info';
  process.env.OPTIC_ENV = 'local';
  process.env.OPTIC_TOKEN = '123';
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

describe('run', () => {
  test('runs and diffs against APIs and runs capture', async () => {
    const workspace = await setupWorkspace('run/multi-spec', {
      repo: true,
      commit: true,
    });
    await setPortInFile(workspace, 'optic.yml');

    const { combined, code } = await runOptic(workspace, 'run');
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(1);
  });

  test('ignores files in gitignore', async () => {
    const workspace = await setupWorkspace('run/gitignore', {
      repo: true,
      commit: true,
    });

    await run(
      `cp openapi.yml openapi-local.yml && echo openapi-local.yml > .gitignore`,
      false,
      workspace
    );

    const { combined, code } = await runOptic(workspace, 'run');
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });

  test('can include files in gitignore with -I and file paths', async () => {
    const workspace = await setupWorkspace('run/gitignore', {
      repo: true,
      commit: true,
    });
    await run(
      `cp openapi.yml openapi-local.yml && echo openapi-local.yml > .gitignore`,
      false,
      workspace
    );
    const { combined, code } = await runOptic(
      workspace,
      'run openapi-local.yml -I'
    );
    expect(normalizeWorkspace(workspace, combined)).toMatchSnapshot();
    expect(code).toBe(0);
  });
});
