import { test, expect, describe } from '@jest/globals';
import { applyGlobFilters } from '../input-generators';

describe('applyGlobFilters', () => {
  test('filters a list of head and base files to match a list of globs and ignore a list of globs', () => {
    const baseFiles = [
      'spec/openapi-2.yml',
      'yarn.lock',
      'spec/openapi-2.json',
      'spec/openapi-2.yaml',
    ];
    const headFiles = [
      'spec/openapi.yml',
      'yarn.lock',
      'spec/openapi.json',
      'spec/openapi.yaml',
    ];
    const globs = ['**.yml', '**.yaml', '**.json'];
    const ignores = ['**/openapi.yml'];

    const { matchingBaseFiles, matchingHeadFiles } = applyGlobFilters(
      baseFiles,
      headFiles,
      {
        matches: globs,
        ignores,
      }
    );
    expect(matchingHeadFiles.size).toBe(2);
    expect(matchingHeadFiles.has('spec/openapi.json')).toBe(true);
    expect(matchingHeadFiles.has('spec/openapi.yaml')).toBe(true);

    expect(matchingBaseFiles.size).toBe(3);
    expect(matchingBaseFiles.has('spec/openapi-2.json')).toBe(true);
    expect(matchingBaseFiles.has('spec/openapi-2.yaml')).toBe(true);
    expect(matchingBaseFiles.has('spec/openapi-2.yml')).toBe(true);
  });
});
