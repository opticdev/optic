import { BodyLocation } from '../../shapes/body';
import { DocumentedBody } from '../../shapes/body';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { SchemaObject } from '../../shapes';

export function jsonBodyInRequest(
  value: any,
  schema: SchemaObject | null
): DocumentedBody {
  return {
    body: {
      value,
      contentType: 'application/json',
    },
    schema,
    bodyLocation: {
      path: '/example',
      method: 'post',
      inRequest: {
        body: {
          contentType: 'application/json',
        },
      },
    },
    specJsonPath: jsonPointerHelpers.compile([
      'paths',
      '/example',
      'post',
      'requestBody',
      'content',
      'application/json',
    ]),
  };
}

export function jsonBodyInResponse(value: any, schema: SchemaObject | null) {
  return {
    body: {
      value,
      contentType: 'application/json',
    },
    schema,
    bodyLocation: {
      path: '/example',
      method: 'post',
      inResponse: {
        statusCode: '200',
        body: {
          contentType: 'application/json',
        },
      },
    },
    specJsonPath: jsonPointerHelpers.compile([
      'paths',
      '/example',
      'post',
      'responses',
      '200',
      'content',
      'application/json',
    ]),
  };
}
