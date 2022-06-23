import { exec } from 'child_process';

export const hasGit = async (): Promise<boolean> =>
  new Promise((resolve) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) resolve(false);
      resolve(true);
    };
    const command = `which git`;
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
