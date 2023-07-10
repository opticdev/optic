import { test, expect, afterAll } from '@jest/globals';
import { getContextFromGitlabEnvironment } from '../gitlab-ci';

const originalEnv = {
  CI_PROJECT_NAMESPACE: process.env.CI_PROJECT_NAMESPACE,
  CI_MERGE_REQUEST_IID: process.env.CI_MERGE_REQUEST_IID,
  CI_PROJECT_NAME: process.env.CI_PROJECT_NAME,
  CI_MERGE_REQUEST_SOURCE_BRANCH_NAME:
    process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME,
  CI_COMMIT_SHA: process.env.CI_COMMIT_SHA,
  CI_CONCURRENT_ID: process.env.CI_CONCURRENT_ID,
  GITLAB_USER_ID: process.env.GITLAB_USER_ID,
};

afterAll(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    process.env[key] = value;
  }
});

test('get context from gitlab environments', () => {
  process.env.CI_PROJECT_NAMESPACE = 'opticdev/namespaced';
  process.env.CI_MERGE_REQUEST_IID = '515';
  process.env.CI_PROJECT_NAME = 'monorail';
  process.env.CI_MERGE_REQUEST_SOURCE_BRANCH_NAME = 'feature-1';
  process.env.CI_COMMIT_SHA = '7d3736f2b38af7f69fd51e43465fd74375aaca2d';
  process.env.CI_CONCURRENT_ID = '123';
  process.env.GITLAB_USER_ID = 'lou';

  expect(getContextFromGitlabEnvironment()).toEqual({
    organization: 'opticdev/namespaced',
    user: 'lou',
    pull_request: 515,
    run: 123,
    commit_hash: '7d3736f2b38af7f69fd51e43465fd74375aaca2d',
    repo: 'monorail',
    branch_name: 'feature-1',
  });
});
