import { describe, expect, jest, test } from '@jest/globals';
import { evaluateRule } from '../rule-evaluation';
import { OpenAPIV3 } from 'openapi-types';

jest.setTimeout(10000);

describe('evaluate rules:', () => {
  test('Check for operationId -- should pass', async () => {
    const operation: OpenAPIV3.OperationObject = {
      operationId: 'getUsers',
      responses: {
        '200': {
          description: 'all the users',
        },
      },
    };
    const result = await evaluateRule(
      {
        entity: 'OPERATION',
        rule: 'Each operation must have an operationId',
        changed: false,
        severity: 'ERROR',
      },
      'GET /todos',
      operation
    );

    expect(result).toMatchSnapshot();
  });
  test('Check for operationId -- should fail', async () => {
    const operation: OpenAPIV3.OperationObject = {
      responses: {
        '200': {
          description: 'all the users',
        },
      },
    };
    const result = await evaluateRule(
      {
        entity: 'OPERATION',
        rule: 'Each operation must have an operationId',
        changed: false,
        severity: 'ERROR',
      },
      'GET /todos',
      operation
    );

    expect(result).toMatchSnapshot();
  });

  describe('Fuzzy property naming rules', () => {
    test('property with date-like name -- should fail', async () => {
      const property = {
        created_at: {
          type: 'string',
          description: 'when the order was made',
        },
      };
      const result = await evaluateRule(
        {
          entity: 'PROPERTY',
          rule: 'Properties that sound like they contain a dates should use format: datetime',
          changed: false,
          severity: 'WARNING',
        },
        'GET /todos in the 200 response',
        property
      );
      expect(result).toMatchSnapshot();
    });
    test('property with date-like name -- should pass', async () => {
      const property = {
        created_at: {
          type: 'string',
          format: 'datetime',
          description: 'when the order was made',
        },
      };
      const result = await evaluateRule(
        {
          entity: 'PROPERTY',
          rule: 'Properties that sound like they contain a dates should use format: datetime',
          changed: false,
          severity: 'WARNING',
        },
        'GET /todos in the 200 response',
        property
      );
      expect(result).toMatchSnapshot();
    });
    test('The keys in an object property should all follow the same naming convention -- not relevant', async () => {
      const property = {
        userId: {
          type: 'string',
        },
      };
      const result = await evaluateRule(
        {
          entity: 'PROPERTY',
          rule: 'The keys in an object property should all follow the same naming convention',
          changed: false,
          severity: 'WARNING',
        },
        'GET /todos in the 200 response',
        property
      );
      expect(result).toMatchSnapshot();
    });
    test('The keys in an object property should all follow the same naming convention -- should fail', async () => {
      const property = {
        user: {
          ID: {
            type: 'string',
          },
          fullName: {
            type: 'string',
          },
          last_name: {
            type: 'string',
          },
        },
      };
      const result = await evaluateRule(
        {
          entity: 'PROPERTY',
          rule: 'The keys in an object property should all follow the same naming convention',
          changed: false,
          severity: 'WARNING',
        },
        'GET /todos in the 200 response',
        property
      );
      expect(result).toMatchSnapshot();
    });
  });
});
