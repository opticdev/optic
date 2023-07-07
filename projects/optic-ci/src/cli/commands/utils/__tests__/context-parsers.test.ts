import { jest, test, expect, describe } from '@jest/globals';
import {
  readAndValidateCircleCiContext,
  readAndValidateGithubContext,
} from '../ci-context-parsers';
import { mockCircleCiContext, mockGhContext } from './mock-context';

// We only mock toString since this module only uses toString
const createMockBuffer = (stringToReturn: string): Buffer => {
  return {
    toString: jest.fn().mockImplementation(() => stringToReturn),
  } as unknown as Buffer;
};

describe('github context parser', () => {
  test('parses github context with appropriate values', () => {
    const mockBuffer = createMockBuffer(JSON.stringify(mockGhContext));
    expect(readAndValidateGithubContext(mockBuffer)).toEqual({
      organization: 'opticdev',
      repo: 'poc-governance-tools',
      pull_request: 61,
      run: 75,
      branch_name: 'handle-git-context-parsing',
      commit_hash: 'ab29f2bc311946eb2ea5e37cb297329081eb06b0',
    });
  });

  test('errors if not valid json', () => {
    const mockBuffer = createMockBuffer('a');
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Unexpected token .* in JSON at position/i
    );
  });

  test('errors if not pull request type', () => {
    const ghContext = {
      ...mockGhContext,
      event_name: 'not pull request',
    };
    const mockBuffer = createMockBuffer(JSON.stringify(ghContext));
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Upload expects to be triggered with a pull_request github workflow action/i
    );
  });

  test('errors if no organization in expected location', () => {
    const ghContext = {
      ...mockGhContext,
      event: {
        ...mockGhContext.event,
        repository: {
          ...mockGhContext.event.repository,
          owner: {},
        },
      },
    };
    const mockBuffer = createMockBuffer(JSON.stringify(ghContext));
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Expected a respository owner at context\.event\.repository\.owner\.login/i
    );
  });

  test('errors if no repo in expected location', () => {
    const ghContext = {
      ...mockGhContext,
      event: {
        ...mockGhContext.event,
        repository: {
          ...mockGhContext.event.repository,
          name: null,
        },
      },
    };
    const mockBuffer = createMockBuffer(JSON.stringify(ghContext));
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Expected a repo at context\.event\.repository\.name/i
    );
  });

  test('errors if no pull_request in expected location', () => {
    const ghContext = {
      ...mockGhContext,
      event: {
        ...mockGhContext.event,
        pull_request: {},
      },
    };
    const mockBuffer = createMockBuffer(JSON.stringify(ghContext));
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Expected a pull_request number at context\.event\.pull_request\.number/i
    );
  });

  test('errors if no branch in expected location', () => {
    const ghContext = {
      ...mockGhContext,
      event: {
        ...mockGhContext.event,
        pull_request: {
          ...mockGhContext.event.pull_request,
          head: {},
        },
      },
    };
    const mockBuffer = createMockBuffer(JSON.stringify(ghContext));
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Expected a branch_name at context\.event\.pull_request\.head\.ref/i
    );
  });

  test('errors if no run in expected location', () => {
    const ghContext = {
      ...mockGhContext,
      run_number: null,
    };
    const mockBuffer = createMockBuffer(JSON.stringify(ghContext));
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Expected a run_number at context\.run_number/i
    );
  });

  test('errors if no sha in expected location', () => {
    const ghContext = {
      ...mockGhContext,
      event: {
        ...mockGhContext.event,
        pull_request: {
          ...mockGhContext.event.pull_request,
          head: {
            ...mockGhContext.event.pull_request.head,
            sha: null,
          },
        },
      },
    };
    const mockBuffer = createMockBuffer(JSON.stringify(ghContext));
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Expected a sha at context\.event\.pull_request\.head\.sha/i
    );
  });
});

describe('circle ci context parser', () => {
  test('parses circle ci context with appropriate values', () => {
    const mockBuffer = createMockBuffer(JSON.stringify(mockCircleCiContext));
    expect(readAndValidateCircleCiContext(mockBuffer)).toEqual({
      organization: 'opticdev',
      repo: 'poc-governance-tools',
      pull_request: 90,
      branch_name: 'handle-git-context-parsing',
      run: 1,
      commit_hash: '35b281f4eb550fb1be47f5a238f57ff00ccae9b7',
    });
  });

  test('errors if not valid json', () => {
    const mockBuffer = createMockBuffer('a');
    expect(() => readAndValidateCircleCiContext(mockBuffer)).toThrowError(
      /Unexpected token .* in JSON at position/i
    );
  });

  test('errors no CIRCLE_REPOSITORY_URL is found', () => {
    const circleCiContext = {
      ...mockCircleCiContext,
      CIRCLE_REPOSITORY_URL: null,
    };
    const mockBuffer = createMockBuffer(JSON.stringify(circleCiContext));
    expect(() => readAndValidateCircleCiContext(mockBuffer)).toThrowError(
      /Expected a CIRCLE_REPOSITORY_URL number at context\.CIRCLE_REPOSITORY_URL/i
    );
  });

  test('errors if url is not in expected format in expected location', () => {
    const circleCiContext = {
      ...mockCircleCiContext,
      CIRCLE_REPOSITORY_URL: 'https://github.com/badformat',
    };
    const mockBuffer = createMockBuffer(JSON.stringify(circleCiContext));
    expect(() => readAndValidateCircleCiContext(mockBuffer)).toThrowError(
      /Could not parse owner or repo from the circle repository url - expected a format of `git_domain\/:owner\/:repo`, got: .*/i
    );
  });

  test('errors if no CIRCLE_PR_NUMBER in expected location', () => {
    const circleCiContext = {
      ...mockCircleCiContext,
      CIRCLE_PR_NUMBER: null,
    };
    const mockBuffer = createMockBuffer(JSON.stringify(circleCiContext));
    expect(() => readAndValidateCircleCiContext(mockBuffer)).toThrowError(
      /Expected a CIRCLE_PR_NUMBER number at context\.CIRCLE_PR_NUMBER/i
    );
  });

  test('errors if no CIRCLE_BRANCH in expected location', () => {
    const circleCiContext = {
      ...mockCircleCiContext,
      CIRCLE_BRANCH: null,
    };
    const mockBuffer = createMockBuffer(JSON.stringify(circleCiContext));
    expect(() => readAndValidateCircleCiContext(mockBuffer)).toThrowError(
      /Expected a CIRCLE_BRANCH number at context\.CIRCLE_BRANCH/i
    );
  });

  test('errors if no CIRCLE_BUILD_NUM in expected location', () => {
    const circleCiContext = {
      ...mockCircleCiContext,
      CIRCLE_BUILD_NUM: null,
    };
    const mockBuffer = createMockBuffer(JSON.stringify(circleCiContext));
    expect(() => readAndValidateCircleCiContext(mockBuffer)).toThrowError(
      /Expected a CIRCLE_BUILD_NUM at context\.CIRCLE_BUILD_NUM/i
    );
  });

  test('errors if no CIRCLE_SHA1 in expected location', () => {
    const circleCiContext = {
      ...mockCircleCiContext,
      CIRCLE_SHA1: null,
    };
    const mockBuffer = createMockBuffer(JSON.stringify(circleCiContext));
    expect(() => readAndValidateCircleCiContext(mockBuffer)).toThrowError(
      /Expected a CIRCLE_SHA1 at context\.CIRCLE_SHA1/i
    );
  });
});
