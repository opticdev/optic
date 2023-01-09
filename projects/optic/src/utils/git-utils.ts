import { exec } from 'child_process';

export const hasGit = async (): Promise<boolean> =>
  new Promise((resolve) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) resolve(false);
      resolve(true);
    };
    const command = `git --version`;
    exec(command, cb);
  });

export const isInGitRepo = async (): Promise<boolean> =>
  new Promise((resolve) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) resolve(false);
      resolve(true);
    };
    const command = `git rev-parse --is-inside-work-tree`;
    exec(command, cb);
  });

export const getRootPath = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) reject();
      resolve(stdout.trim());
    };
    const command = `git rev-parse --show-toplevel`;
    exec(command, cb);
  });

export const isGitStatusClean = async (): Promise<boolean> =>
  new Promise((resolve, reject) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr) reject(err || stderr);
      resolve(stdout.trim() === '');
    };
    const command = `git status --porcelain`;
    exec(command, cb);
  });

export const resolveGitRef = async (ref: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) reject(err || stderr);
      resolve(stdout.trim());
    };
    const command = `git rev-parse ${ref}`;
    exec(command, cb);
  });

export const findOpenApiSpecsCandidates = async (
  ref?: string
): Promise<string[]> =>
  new Promise((resolve, reject) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) reject(err || stderr);
      resolve(
        stdout
          .trim()
          .split('\n')
          .filter((path) => !!path)
      );
    };
    const command = `toplevel=$(git rev-parse --show-toplevel) && \
    git grep --untracked --name-only -E 'openapi' ${ref ? ref : ''} -- \
    $toplevel/'*.yml' \
    $toplevel/'*.yaml' \
    $toplevel/'*.json' \
    || true`;
    exec(command, cb);
  });
