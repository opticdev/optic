import { UserError } from '../../../../errors';
import { getContextFromGithubEnvironment } from '../github-actions';

const originalEnv = {
  GITHUB_REPOSITORY_OWNER: process.env.GITHUB_REPOSITORY_OWNER,
  GITHUB_REF: process.env.GITHUB_REF,
  GITHUB_RUN_NUMBER: process.env.GITHUB_RUN_NUMBER,
  GITHUB_SHA: process.env.GITHUB_SHA,
  GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY,
  GITHUB_HEAD_REF: process.env.GITHUB_HEAD_REF,
};

afterAll(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    process.env[key] = value;
  }
});

test('get context from github environments', () => {
  process.env.GITHUB_REPOSITORY_OWNER = 'opticdev';
  process.env.GITHUB_REF = 'refs/pull/515/merge';
  process.env.GITHUB_RUN_NUMBER = '123';
  process.env.GITHUB_SHA = '7d3736f2b38af7f69fd51e43465fd74375aaca2d';
  process.env.GITHUB_REPOSITORY = 'optidev/monorail';
  process.env.GITHUB_HEAD_REF = 'feature-1';

  expect(getContextFromGithubEnvironment()).toEqual({
    organization: 'opticdev',
    pull_request: 515,
    run: 123,
    commit_hash: '7d3736f2b38af7f69fd51e43465fd74375aaca2d',
    repo: 'monorail',
    branch_name: 'feature-1',
  });
});

test('get context from non-pull request actions', () => {
  process.env.GITHUB_REPOSITORY_OWNER = 'opticdev';
  process.env.GITHUB_REF = 'refs/heads/feature-branch-1';
  process.env.GITHUB_RUN_NUMBER = '123';
  process.env.GITHUB_SHA = '7d3736f2b38af7f69fd51e43465fd74375aaca2d';
  process.env.GITHUB_REPOSITORY = 'optidev/monorail';
  process.env.GITHUB_HEAD_REF = 'feature-branch-1';

  expect(() => {
    getContextFromGithubEnvironment();
  }).toThrowError(UserError);
});
