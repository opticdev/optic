import { it, expect } from '@jest/globals';
import { filePathToGitPath } from '../resolvers/git-branch-file-resolver';

it('can relativize a windows path', () => {
  expect(
    filePathToGitPath(
      'C:Users\\circleupx\\source\\openapi-demo\\',
      'C:Users\\circleupx\\source\\openapi-demo\\todo-api.yaml'
    )
  ).toMatchInlineSnapshot('"todo-api.yaml"');
});
it('can relativize a deep windows path', () => {
  expect(
    filePathToGitPath(
      'C:Users\\circleupx\\source\\openapi-demo\\',
      'C:Users\\circleupx\\source\\openapi-demo\\todo\\specs\\a-service.yaml'
    )
  ).toMatchInlineSnapshot(`"todo/specs/a-service.yaml"`);
});
it(' windows path', () => {
  expect(
    filePathToGitPath(
      'C:Users/aidancunniffe/Desktop/openapi-demo',
      'C:Users/aidancunniffe/Desktop/openapi-demo/todo-api.yaml'
    )
  ).toMatchInlineSnapshot(`"todo-api.yaml"`);
});
