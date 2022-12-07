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
