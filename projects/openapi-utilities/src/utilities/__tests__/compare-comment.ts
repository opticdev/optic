import { createMultiSessionsCommentBody } from '../compare-comment';

const comparison = {
  results: [
    {
      passed: true,
      condition: 'have snake case keys',
      where: 'added field: strangeness',
      isMust: true,
      isShould: false,
      change: {
        location: {
          jsonPath:
            '/paths/~1orgs~1{org_id}~1thing~1{thing_id}/get/responses/200/content/application~1vnd.api+json/schema/properties/data/properties/attributes/properties/strangeness',
          conceptualPath: [
            'operations',
            '/orgs/{}/thing/{}',
            'get',
            'responses',
            '200',
            'application/vnd.api+json',
            'data',
            'attributes',
            'strangeness',
          ],
          kind: 'field',
          conceptualLocation: {
            method: 'get',
            path: '/orgs/{org_id}/thing/{thing_id}',
            inResponse: {
              statusCode: '200',
              body: {
                contentType: 'application/vnd.api+json',
              },
            },
            jsonSchemaTrail: ['data', 'attributes', 'strangeness'],
          },
        },
        added: {
          key: 'strangeness',
          flatSchema: {
            type: 'number',
            description:
              'The amount of strangeness this thing adds or removes from the situation.',
            example: 42,
          },
          required: true,
        },
        changeType: 'added',
      },
      sourcemap: {
        filePath:
          '/end-end-tests/api-standards/resources/thing/2021-11-10/001-ok-add-property-field.yaml',
        startLine: 221,
        endLine: 224,
        preview: '',
        startPosition: 10080,
        endPosition: 10233,
      },
    },
  ],
  changes: [
    {
      location: {
        jsonPath: '/paths/~1user~1{username}/get',
        conceptualPath: ['operations', '/user/{}', 'get'],
        kind: 'operation',
        conceptualLocation: { method: 'get', path: '/user/{username}' },
        sourcemap: {
          filePath:
            '/end-end-tests/api-standards/resources/thing/2021-11-10/001-ok-add-property-field.yaml',
          startLine: 221,
          endLine: 224,
          preview: '',
          startPosition: 10080,
          endPosition: 10233,
        },
      },
      added: {
        tags: ['user'],
        summary: 'Get user by user name',
        operationId: 'getUserByName',
        method: 'get',
        pathPattern: '/user/{username}',
      },
      changeType: 'added',
    },
  ],
} as any;

describe('compareComment', () => {
  test('', () => {
    const output = createMultiSessionsCommentBody(
      'commit_hash',
      'compare_hash',
      [
        {
          apiName: 'test',
          compareFile: comparison,
          opticWebUrl: 'opticWebUrl',
          run: 1,
        },
        {
          apiName: 'test2',
          compareFile: comparison,
          opticWebUrl: 'opticWebUrl2',
          run: 2,
        },
      ]
    );
    expect(output).toMatchSnapshot();
  });
});
