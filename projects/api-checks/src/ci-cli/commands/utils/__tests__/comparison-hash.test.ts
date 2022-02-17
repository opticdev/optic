import { generateHashForComparison } from '../comparison-hash';

const comparison1 = {
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

const comparison1WithFailedResult = {
  results: [
    {
      passed: false,
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

describe('generateHashForComparison', () => {
  test('generates stable hashes', () => {
    expect(generateHashForComparison(comparison1)).toBe(
      generateHashForComparison(comparison1)
    );
  });

  test('generates stable hashes for multiple comparisons', () => {
    expect(
      generateHashForComparison([comparison1, comparison1WithFailedResult])
    ).toBe(
      generateHashForComparison([comparison1, comparison1WithFailedResult])
    );
  });

  test('generates stable hashes with different JSON stringify ordering', () => {
    expect(generateHashForComparison(comparison1)).toBe(
      generateHashForComparison({
        changes: comparison1.changes,
        results: comparison1.results,
      })
    );
  });

  test('generates different hashes for different comparisons', () => {
    expect(generateHashForComparison(comparison1)).not.toBe(
      generateHashForComparison(comparison1WithFailedResult)
    );
  });
});
