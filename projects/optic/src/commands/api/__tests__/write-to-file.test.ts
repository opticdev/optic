import { test, expect, describe, beforeEach, jest } from '@jest/globals';
import { addExtensionsToYaml } from '../write-to-file';
const yaml = `
openapi: 3.0.1
info:
  title: TodoAPI
  version: "1.1"
"x-hello": "testing..."
paths:
  /todos/{todoId}:
    get:
      parameters:
        - name: limit
          in: query
          schema:
            type: number
          required: true
      responses:
        '200':
          description: ok
          content:
            application/json:
              schema:
                type: object
                properties:
                  todos:
                    type: array
                    items:
                      $ref: "./schemas.yml#/TodoRead"
                required:
                  - todos
`;
describe('yaml surgical patching', () => {
  test('can add extensions to yaml', () => {
    const result = addExtensionsToYaml(yaml, {
      'x-optic-url': 'https://fun.url.example',
    });
    expect(result).toMatchSnapshot();
  });
  test('can update extensions already in yaml', () => {
    const result = addExtensionsToYaml(yaml, {
      'x-hello': 'world',
    });
    expect(result).toMatchSnapshot();
  });
});
