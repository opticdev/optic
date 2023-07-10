import { jest, test, expect, afterAll } from '@jest/globals';
import fs from 'fs/promises';
import { UserError } from '@useoptic/openapi-utilities';
import { getContextFromGithubEnvironment } from '../github-actions';

jest.mock('fs/promises');
const mockReadFile = fs.readFile as jest.MockedFunction<typeof fs.readFile>;

const originalEnv = {
  GITHUB_REPOSITORY_OWNER: process.env.GITHUB_REPOSITORY_OWNER,
  GITHUB_REF: process.env.GITHUB_REF,
  GITHUB_RUN_NUMBER: process.env.GITHUB_RUN_NUMBER,
  GITHUB_SHA: process.env.GITHUB_SHA,
  GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
  GITHUB_HEAD_REF: process.env.GITHUB_HEAD_REF,
  GITHUB_CONTEXT: process.env.GITHUB_CONTEXT,
};

afterAll(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    process.env[key] = value;
  }
  mockReadFile.mockClear();
});

test('get context from github environments', async () => {
  process.env.GITHUB_REPOSITORY_OWNER = 'opticdev';
  process.env.GITHUB_REF = 'refs/pull/515/merge';
  process.env.GITHUB_RUN_NUMBER = '123';
  process.env.GITHUB_SHA = '7d3736f2b38af7f69fd51e43465fd74375aaca2d';
  process.env.GITHUB_REPOSITORY = 'optidev/monorail';
  process.env.GITHUB_HEAD_REF = 'feature-1';

  expect(await getContextFromGithubEnvironment()).toEqual({
    organization: 'opticdev',
    user: null,
    pull_request: 515,
    run: 123,
    commit_hash: '7d3736f2b38af7f69fd51e43465fd74375aaca2d',
    repo: 'monorail',
    branch_name: 'feature-1',
  });
});

test('get context from non-pull request actions', async () => {
  process.env.GITHUB_REPOSITORY_OWNER = 'opticdev';
  process.env.GITHUB_REF = 'refs/heads/feature-branch-1';
  process.env.GITHUB_RUN_NUMBER = '123';
  process.env.GITHUB_SHA = '7d3736f2b38af7f69fd51e43465fd74375aaca2d';
  process.env.GITHUB_REPOSITORY = 'optidev/monorail';
  process.env.GITHUB_HEAD_REF = 'feature-branch-1';

  expect(async () => {
    await getContextFromGithubEnvironment();
  }).rejects.toThrowError(UserError);
});

test('get head sha from github context', async () => {
  process.env.GITHUB_EVENT_PATH = '123123';
  process.env.GITHUB_REPOSITORY_OWNER = 'opticdev';
  process.env.GITHUB_REF = 'refs/pull/515/merge';
  process.env.GITHUB_RUN_NUMBER = '123';
  process.env.GITHUB_SHA = 'asdasd';
  process.env.GITHUB_REPOSITORY = 'optidev/monorail';
  process.env.GITHUB_HEAD_REF = 'feature-1';
  mockReadFile.mockImplementation(
    () =>
      Promise.resolve(
        Buffer.from(
          JSON.stringify({
            pull_request: {
              head: {
                user: {
                  login: 'lou',
                },
                sha: '7d3736f2b38af7f69fd51e43465fd74375aaca2d',
              },
            },
          })
        )
      ) as any
  );

  expect(await getContextFromGithubEnvironment()).toEqual({
    organization: 'opticdev',
    user: 'lou',
    pull_request: 515,
    run: 123,
    commit_hash: '7d3736f2b38af7f69fd51e43465fd74375aaca2d',
    repo: 'monorail',
    branch_name: 'feature-1',
  });
});
