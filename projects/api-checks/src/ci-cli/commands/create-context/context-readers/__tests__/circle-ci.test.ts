import { UserError } from '../../../../errors';
import { getContextFromCircleCiEnvironment } from '../circle-ci';

const originalEnv = {
  CIRCLE_PROJECT_USERNAME: process.env.CIRCLE_PROJECT_USERNAME,
  CIRCLE_PULL_REQUEST: process.env.CIRCLE_PULL_REQUEST,
  CIRCLE_PROJECT_REPONAME: process.env.CIRCLE_PROJECT_REPONAME,
  CIRCLE_BRANCH: process.env.CIRCLE_BRANCH,
  CIRCLE_SHA1: process.env.CIRCLE_SHA1,
  CIRCLE_BUILD_NUM: process.env.CIRCLE_BUILD_NUM,
};

afterAll(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    process.env[key] = value;
  }
});

test('get context from circleci environments', () => {
  process.env.CIRCLE_PROJECT_USERNAME = 'opticdev';
  process.env.CIRCLE_PULL_REQUEST = 'https://github.com/org/project/pull/515';
  process.env.CIRCLE_PROJECT_REPONAME = 'monorail';
  process.env.CIRCLE_BRANCH = 'feature-1';
  process.env.CIRCLE_SHA1 = '7d3736f2b38af7f69fd51e43465fd74375aaca2d';
  process.env.CIRCLE_BUILD_NUM = '123';

  expect(getContextFromCircleCiEnvironment()).toEqual({
    organization: 'opticdev',
    pull_request: 515,
    run: 123,
    commit_hash: '7d3736f2b38af7f69fd51e43465fd74375aaca2d',
    repo: 'monorail',
    branch_name: 'feature-1',
  });
});

test('get context throws error with invalid PR url', () => {
  process.env.CIRCLE_PROJECT_USERNAME = 'opticdev';
  process.env.CIRCLE_PULL_REQUEST = 'https://github.com/orgprojectpull515';
  process.env.CIRCLE_PROJECT_REPONAME = 'monorail';
  process.env.CIRCLE_BRANCH = 'feature-1';
  process.env.CIRCLE_SHA1 = '7d3736f2b38af7f69fd51e43465fd74375aaca2d';
  process.env.CIRCLE_BUILD_NUM = '123';

  expect(() => {
    getContextFromCircleCiEnvironment();
  }).toThrowError(UserError);
});
