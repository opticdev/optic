import { it, expect, describe } from '@jest/globals';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { applyOperationsToYamlString } from './yaml-roundtrip';

describe('applying non destructive patches to yaml', () => {
  it('adding to an array collection', async () => {
    const result = applyOperationsToYamlString(
      `# This is YAML.
---
"items":

  - an array

  - 'of values'
`,
      [
        {
          op: 'add',
          value: { HELLO: { name: 'WORLD', in: 'query' } },
          path: jsonPointerHelpers.compile(['items', '0']),
        },
      ]
    );

    expect(result).toMatchSnapshot();
  });

  it('adding to an object collection', async () => {
    const result = applyOperationsToYamlString(
      `# This is YAML.
---
"items":

  - an array

  - 'of values'
`,
      [
        {
          op: 'add',
          value: {
            offset: 0,
            items: 2,
            totalCount: 14,
            nextPageUrl: 'https://api.example.com/items/2',
          },
          path: jsonPointerHelpers.compile(['cursor']),
        },
      ]
    );

    expect(result).toMatchSnapshot();
  });

  it('removing from an array collection', async () => {
    const result = applyOperationsToYamlString(
      `# This is YAML.
---
"items":

  - an array

  - 'of values'
`,
      [
        {
          op: 'remove',
          path: jsonPointerHelpers.compile(['items', '1']),
        },
      ]
    );

    expect(result).toMatchSnapshot();
  });

  it('removing key from root object', async () => {
    const result = applyOperationsToYamlString(
      `# This is YAML.
---
"items":

  - an array

  - 'of values'
`,
      [
        {
          op: 'remove',
          path: jsonPointerHelpers.compile(['items']),
        },
        {
          op: 'add',
          path: jsonPointerHelpers.compile(['hello']),
          value: 'WORLD',
        },
      ]
    );

    expect(result).toMatchSnapshot();
  });

  it('replacing a string with a string', async () => {
    const result = applyOperationsToYamlString(
      `# This is YAML.
---
"items":

  - an array

  - 'of values'
`,
      [
        {
          op: 'replace',
          value: true,
          path: jsonPointerHelpers.compile(['items', '0']),
        },
      ]
    );

    expect(result).toMatchSnapshot();
  });
  it('replacing a string with an array', async () => {
    const result = applyOperationsToYamlString(
      `# This is YAML.
---
"items":

  - an array

  - 'of values'
`,
      [
        {
          op: 'replace',
          value: ['red', 'blue', 'yellow'],
          path: jsonPointerHelpers.compile(['items', '0']),
        },
      ]
    );

    expect(result).toMatchSnapshot();
  });
  it('replacing root object key', async () => {
    const result = applyOperationsToYamlString(
      `# This is YAML.
---
"items":

  - an array

  - 'of values'
`,
      [
        {
          op: 'replace',
          value: ['red', 'blue', 'yellow'],
          path: jsonPointerHelpers.compile(['items']),
        },
      ]
    );

    expect(result).toMatchSnapshot();
  });

  it('works with a real world patch', () => {
    const result = applyOperationsToYamlString(
      `
openapi: 3.0.3
# Optic stuff...
x-optic-path-ignore:
  - '**/**.ico'
info:
  title: Untitled service
  version: 1.0.0

# Aidan Added a comment here
paths:
  /todos:
    get:
      responses:
        '200':
          description: 200 response
          content:
            application/json; charset=utf-8:
              schema:
                type: object
                properties:
                  todos:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        completed_at:
                          type: string
                        color:
                          type: string
                      required:
                        - name
                        - color
                required:
                  - todos

`,
      [
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/required/-',
          value: 'links',
        },
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/links',
          value: { type: 'object' },
        },
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/todos/items/required/-',
          value: 'status',
        },
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/todos/items/properties/status',
          value: { type: 'string' },
        },
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/todos/items/required/-',
          value: 'created_at',
        },
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/todos/items/properties/created_at',
          value: { type: 'string' },
        },
        {
          op: 'remove',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/todos/items/required/1',
        },
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/todos/items/required/-',
          value: 'due_at',
        },
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/todos/items/properties/due_at',
          value: { type: 'string' },
        },
        {
          op: 'remove',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/todos/items/required/3',
        },
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/links/properties',
          value: {},
        },
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/links/required',
          value: ['completed_todos'],
          extra: 'same',
        } as any,
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/links/properties/completed_todos',
          value: { type: 'string' },
        },
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/links/required/-',
          value: 'archived_todos',
        },
        {
          op: 'add',
          path: '/paths/~1todos/get/responses/200/content/application~1json; charset=utf-8/schema/properties/links/properties/archived_todos',
          value: { type: 'string' },
        },
      ]
    );
    expect(result).toMatchSnapshot();
  });
  it('works with a real world patch with correct number keys (status codes)', () => {
    const result = applyOperationsToYamlString(
      `
openapi: 3.0.3
# Optic stuff...
x-optic-path-ignore:
  - '**/**.ico'
info:
  title: Untitled service
  version: 1.0.0

# Aidan Added a comment here
paths:
  /todos:
    get:
      responses:
        '200':
          description: 200 response
          content:
            application/json; charset=utf-8:
              schema:
                type: object
                properties:
                  todos:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        completed_at:
                          type: string
                        color:
                          type: string
                      required:
                        - name
                        - color
                required:
                  - todos

`,
      [
        { op: 'add', path: '/paths/~1users', value: {} },
        { op: 'add', path: '/paths/~1users/get', value: { responses: {} } },
        { op: 'add', path: '/paths/~1_private~1browser~1stats', value: {} },
        {
          op: 'add',
          path: '/paths/~1_private~1browser~1stats/post',
          value: { responses: {} },
        },
        { op: 'add', path: '/paths/~1orgs~1easystats', value: {} },
        {
          op: 'add',
          path: '/paths/~1orgs~1easystats/get',
          value: { responses: {} },
        },
        { op: 'add', path: '/paths/~1orgs~1easystats~1hooks', value: {} },
        {
          op: 'add',
          path: '/paths/~1orgs~1easystats~1hooks/get',
          value: { responses: {} },
        },
        { op: 'add', path: '/paths/~1users~1{user}~1followers', value: {} },
        {
          op: 'add',
          path: '/paths/~1users~1{user}~1followers/parameters',
          value: [{ in: 'path', name: 'user', required: true }],
        },
        {
          op: 'add',
          path: '/paths/~1users~1{user}~1followers/get',
          value: { responses: {} },
        },
        { op: 'add', path: '/paths/~1users~1{user}~1orgs', value: {} },
        {
          op: 'add',
          path: '/paths/~1users~1{user}~1orgs/parameters',
          value: [{ in: 'path', name: 'user', required: true }],
        },
        {
          op: 'add',
          path: '/paths/~1users~1{user}~1orgs/get',
          value: { responses: {} },
        },
        {
          op: 'add',
          path: '/paths/~1_private~1browser~1stats/post/requestBody',
          value: { content: {} },
        },
        {
          op: 'add',
          path: '/paths/~1_private~1browser~1stats/post/requestBody/content/text~1plain;charset=UTF-8',
          value: {},
        },
        {
          op: 'add',
          path: '/paths/~1_private~1browser~1stats/post/responses/200',
          value: { description: '200 response' },
        },
        {
          op: 'add',
          path: '/paths/~1users~1{user}~1followers/get/responses/200',
          value: { description: '200 response' },
        },
        {
          op: 'add',
          path: '/paths/~1users~1{user}~1followers/get/responses/200/content',
          value: { 'application/json; charset=utf-8': {} },
        },
        {
          op: 'add',
          path: '/paths/~1users~1{user}~1orgs/get/responses/200',
          value: { description: '200 response' },
        },
        {
          op: 'add',
          path: '/paths/~1users~1{user}~1orgs/get/responses/200/content',
          value: { 'application/json; charset=utf-8': {} },
        },
        {
          op: 'add',
          path: '/paths/~1orgs~1easystats/get/responses/200',
          value: { description: '200 response' },
        },
        {
          op: 'add',
          path: '/paths/~1orgs~1easystats/get/responses/200/content',
          value: { 'application/json; charset=utf-8': {} },
        },
        {
          op: 'add',
          path: '/paths/~1orgs~1easystats~1hooks/get/responses/404',
          value: { description: '404 response' },
        },
        {
          op: 'add',
          path: '/paths/~1orgs~1easystats~1hooks/get/responses/404/content',
          value: { 'application/json; charset=utf-8': {} },
        },
      ]
    );
    expect(result).toMatchSnapshot();
  });
});
