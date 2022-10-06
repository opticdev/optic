import { Standard } from '../../entity/versions/v3';
import {
  changed,
  requirement,
  schemaRequirement,
} from '../../attribute/assertions';
import { matches } from '../../runner/matcher';

// Parameters
const LimitQuery = Standard.Parameter({
  in: 'query',
  name: 'limit',
  required: requirement('always be optional', (required) => {}),
  schema: requirement('must be a number from 0 -> 150'),
});

const RequestIdHeader = Standard.Parameter({
  in: 'header',
  name: 'Request-Id',
  required: requirement('must always be required', (required) => {}),
  schema: requirement('must be a string'),
});

// Responses
const AllResponses = Standard.Response('*', {
  content: {
    'application/json': {
      example: requirement('must specify an example'),
    },
  },
});

const x200PaginatedListResponse = Standard.Response('204', {
  description: requirement('must have a description'),
  content: {
    'application/json': {
      schema: schemaRequirement('paginated list body must be used', {
        type: 'object',
        properties: {
          cursor: {
            type: 'string',
          },
          items: {
            type: 'array',
            items: {},
          },
        },
      }),
    },
  },
});

const x404NotFoundResponse = Standard.Response('404', {
  content: {
    'application/json': {
      schema: requirement('standard 404 schema used'),
    },
  },
});

// Operations

export const GetOperations = Standard.Operation({
  filter: matches('applies to all GET operations', (operation, context) => {
    return context.method === 'get';
  }),
  standard: {
    parameters: [LimitQuery, RequestIdHeader],
    responses: [x200PaginatedListResponse, x404NotFoundResponse],
  },
});

export const AllOperations = Standard.Operation({
  summary: requirement('must have a summary', (summary) => {
    if (!summary) throw new Error('must have a summary set ');
  }),
  operationId: [
    requirement(
      'must have an operationId of format methodResource',
      (operationId, context) => {
        if (!operationId) throw new Error('does not have an operation id');
        context.method.toLowerCase();
        const regex = `${context.method.toLowerCase()}[A-Z][a-z]+(?:[A-Z][a-z]+)*$`;
        if (!operationId.match(regex))
          throw new Error(
            `operation id must be format methodResource. '${operationId}' did not match`
          );
      }
    ),
    changed('operationId must remain consistent', (before, after) => {
      if (!before) return; // this is the case where it was not set, and now it is set. don't fail here
      if (before && after && before !== after) {
        throw new Error(
          `operationId was changed from '${before}' to '${after}'. This is not allowed`
        );
      }
    }),
  ],
  'x-rate-limit-mode': requirement(
    'must set a rate limit mode',
    (rateLimit) => {
      const options = ['internal', 'partner', 'enterprise', 'top', 'limited'];

      const error =
        'x-rate-limit-mode must be one of the following internal|partner|enterprise|top|limited';
      if (typeof rateLimit !== 'string') throw new Error(error);
      if (!options.includes(rateLimit)) throw new Error(error);
    }
  ),
});
