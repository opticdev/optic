import { readAndValidateGithubContext } from "../context-parsers";
import { mockGhContext } from "./mock-gh-context";

// We only mock toString since this module only uses toString
const createMockBuffer = (stringToReturn: string): Buffer => {
  return {
    toString: jest.fn().mockImplementation(() => stringToReturn),
  } as unknown as Buffer;
};

describe("github context parser", () => {
  test("parses github context with appropriate values", () => {
    const mockBuffer = createMockBuffer(JSON.stringify(mockGhContext));
    expect(readAndValidateGithubContext(mockBuffer)).toEqual({
      organization: "opticdev",
      repo: "poc-governance-tools",
      pull_request: 61,
      run: 75,
      run_attempt: 1,
    });
  });

  test("errors if not valid json", () => {
    const mockBuffer = createMockBuffer("a");
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Unexpected token .* in JSON at position/i
    );
  });

  test("errors if not pull request type", () => {
    const ghContext = {
      ...mockGhContext,
      event_name: "not pull request",
    };
    const mockBuffer = createMockBuffer(JSON.stringify(ghContext));
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Upload expects to be triggered with a pull_request github workflow action/i
    );
  });

  test("errors if no organization in expected location", () => {
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

  test("errors if no repo in expected location", () => {
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

  test("errors if no pull_request in expected location", () => {
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

  test("errors if no run in expected location", () => {
    const ghContext = {
      ...mockGhContext,
      run_number: null,
    };
    const mockBuffer = createMockBuffer(JSON.stringify(ghContext));
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Expected a run_number at context\.run_number/i
    );
  });

  test("errors if no run_attempt in expected location", () => {
    const ghContext = {
      ...mockGhContext,
      run_attempt: null,
    };
    const mockBuffer = createMockBuffer(JSON.stringify(ghContext));
    expect(() => readAndValidateGithubContext(mockBuffer)).toThrowError(
      /Expected a run_attempt at context\.run_attempt/i
    );
  });
});
