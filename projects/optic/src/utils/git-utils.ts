import { exec } from 'child_process';
import path from 'path';
import giturlparse from 'git-url-parse';
import urljoin from 'url-join';

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

export const getDefaultBranchName = async (): Promise<string | null> => {
  let remote: string;
  try {
    const gitRemotes = await remotes();
    if (gitRemotes.length === 0) {
      return null;
    }

    remote = gitRemotes[0];
  } catch (e) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) resolve(null);

      const match = stdout.match(/HEAD branch\: (.*)\n/);
      const defaultBranch = match?.[1] ?? null;

      resolve(defaultBranch);
    };

    const command = `git remote show ${remote}`;
    exec(command, cb);
  });
};

export const gitShow = async (ref: string, path: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) reject(err || new Error(stderr));
      resolve(stdout.trim());
    };

    const command = `git show ${ref}:${path}`;
    exec(command, cb);
  });

export const getCurrentBranchName = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) reject();
      resolve(stdout.trim());
    };

    const command = 'git rev-parse --abbrev-ref HEAD';
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

export const gitStatus = async (): Promise<string> =>
  new Promise((resolve, reject) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr) reject(err || stderr);
      resolve(stdout.trim());
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

export const commitTime = async (ref: string): Promise<Date> =>
  new Promise((resolve, reject) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) reject(err || stderr);
      resolve(new Date(parseInt(stdout.trim()) * 1000));
    };
    const command = `git show --date=iso-strict --format=%ct ${ref}`;
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
    const args = ref
      ? `--name-only -E 'openapi' ${ref}`
      : `--untracked --name-only -E 'openapi'`;
    const command = `toplevel=$(git rev-parse --show-toplevel) && \
    git grep ${args} -- \
    $toplevel/'*.yml' \
    $toplevel/'*.yaml' \
    $toplevel/'*.json' \
    || true`;
    exec(command, cb);
  });

export const remotes = async (): Promise<string[]> =>
  new Promise((resolve, reject) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) reject(err || stderr);
      resolve(
        stdout
          .trim()
          .split('\n')
          .filter((remote) => remote.trim())
      );
    };
    const command = `git remote`;
    exec(command, cb);
  });

export const getRemoteUrl = async (remote: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const cb = (err: unknown, stdout: string, stderr: string) => {
      if (err || stderr || !stdout) reject(err || stderr);
      resolve(stdout.trim());
    };

    const command = `git remote get-url ${remote}`;
    exec(command, cb);
  });

export const guessRemoteOrigin = async (): Promise<{
  provider: 'github' | 'gitlab';
  web_url: string;
} | null> => {
  let remoteUrl: string;

  try {
    const gitRemotes = await remotes();
    if (gitRemotes.length === 0) {
      return null;
    }

    remoteUrl = await getRemoteUrl(gitRemotes[0]);
  } catch (e) {
    return null;
  }

  try {
    const parsed = giturlparse(remoteUrl);

    if (/github/i.test(parsed.resource)) {
      return {
        provider: 'github',
        web_url: `https://${urljoin(parsed.resource, parsed.full_name)}`,
      };
    } else if (/gitlab/i.test(parsed.resource)) {
      return {
        provider: 'gitlab',
        web_url: `https://${urljoin(parsed.resource, parsed.full_name)}`,
      };
    }
  } catch (e) {
    return null;
  }

  return null;
};
