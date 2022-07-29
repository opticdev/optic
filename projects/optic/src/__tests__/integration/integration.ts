import fs from 'node:fs/promises';
import os from 'node:os';
import { spawn } from 'child_process';
import path from 'node:path';

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
  const result = {
    stdout: '',
    stderr: '',
    combined: '',
    code: 0,
  } as ProcessResult;

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
    const { code: gitInitCode } = await run('git init', false, dir);
    if (gitInitCode !== 0) {
      throw `Git init failed in ${dir}`;
    }
    if (options.commit) {
      const { code, combined } = await run(
        `git add . && git commit -m 'first commit'`,
        false,
        dir
      );
      if (code !== 0) {
        throw new Error(`Git commit failed in ${dir}: ${combined}`);
      }
    }
  }

  return dir;
}

export async function runOptic(
  workspace: string,
  cmd: string,
  print = false
): Promise<ProcessResult> {
  const src = path.join(root, 'src', 'index.ts');
  const tsNode = path.join(root, 'node_modules', '.bin', 'ts-node');

  const result = await run(`${tsNode}  ${src} ${cmd}`, print, workspace);

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
