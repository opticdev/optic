import { beforeEach, afterEach } from '@jest/globals';
import http from 'http';
import fs from 'node:fs/promises';
import { spawn } from 'child_process';
import path from 'node:path';
import { AddressInfo } from 'net';

const root = path.join(__dirname, '..', '..', '..');

export type ProcessResult = {
  stdout: string;
  stderr: string;
  combined: string;
  code: number | null;
};

export async function run(
  command: string,
  print = true,
  cwd = process.cwd()
): Promise<ProcessResult> {
  const result: ProcessResult = {
    stdout: '',
    stderr: '',
    combined: '',
    code: 0,
  };

  return new Promise((resolve, reject) => {
    const proc = spawn(command, [], {
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe'],
      cwd,
      env: {
        ...process.env,
        FORCE_COLOR: '1',
      },
    });

    proc.on('close', (code) => {
      result.code = code;
      resolve(result);
    });

    proc.on('error', (err) => {
      reject(err);
    });

    proc.stdout.on('data', (data) => {
      if (print) {
        process.stdout.write(data);
      }
      result.stdout += data;
      result.combined += data;
    });

    proc.stderr.on('data', (data) => {
      if (print) {
        process.stderr.write(data);
      }
      result.stderr += data;
      result.combined += data;
    });
  });
}

export async function setupWorkspace(
  template: string,
  providedOptions: { repo?: boolean; commit?: boolean } = {}
): Promise<string> {
  const defaultOptions = { repo: true, commit: false };
  const options = { ...defaultOptions, ...providedOptions };
  const templatePath = path.join(__dirname, 'workspaces', template);
  const dir = await fs.mkdtemp(path.join(root, 'tmp/'));

  const { code: cpCode } = await run(`cp -R ${templatePath}/* ${dir}/`, false);
  if (cpCode !== 0) {
    throw `Failed to copy workspace template ${template}`;
  }

  if (options.repo) {
    const { code: gitInitCode, combined: gitCombined } = await run(
      'git init -b master \
      && git config user.email "test@useoptic.com" \
      && git config user.name "Optic test" \
      && git config commit.gpgsign false \
      && git remote add origin git@github.com:User/UserRepo.git',
      false,
      dir
    );
    if (gitInitCode !== 0) {
      throw `Git init failed in ${dir}: ${gitCombined}`;
    }
    if (options.commit) {
      const { code: commitCode, combined: commitCombined } = await run(
        `git add . && git commit -m 'first commit'`,
        false,
        dir
      );
      if (commitCode !== 0) {
        throw `Git commit failed in ${dir}: ${commitCombined}`;
      }
    }
  }

  return dir;
}

export async function runOptic(
  workspace: string,
  cmd: string
): Promise<ProcessResult> {
  const src = path.join(root, 'src', 'index.ts');
  const tsNode = path.join(root, 'node_modules', '.bin', 'ts-node');

  const result = await run(`${tsNode}  ${src} ${cmd}`, false, workspace);

  return result;
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.stat(path);
  } catch {
    return false;
  }

  return true;
}

export function normalizeWorkspace(workspace: string, text: string): string {
  return text.replace(new RegExp(workspace, 'g'), '$$workspace$$');
}

let server: http.Server;

type MockHttpHandler = (req: { url: string; method: string }) => any;

export let reqs: http.IncomingMessage[] = [];
const createListener = (handler?: MockHttpHandler) => {
  return async function listener(
    req: http.IncomingMessage,
    resp: http.ServerResponse
  ) {
    reqs.push(req);

    resp.writeHead(200);
    const body =
      req.url && req.method && handler
        ? await handler({ url: req.url, method: req.method })
        : undefined;
    resp.end(body);
  };
};

export function setupTestServer(maybeHandler?: MockHttpHandler) {
  let originalBwtsHostOverride = process.env.BWTS_HOST_OVERRIDE;
  beforeEach(() => {
    reqs = [];
    server = http.createServer(createListener(maybeHandler));
    server.listen();
    originalBwtsHostOverride = process.env.BWTS_HOST_OVERRIDE;
    const { port } = server.address() as AddressInfo;

    process.env.BWTS_HOST_OVERRIDE = `http://127.0.0.1:${port}`;
  });

  afterEach(() => {
    server.close();
    process.env.BWTS_HOST_OVERRIDE = originalBwtsHostOverride;
  });
}
