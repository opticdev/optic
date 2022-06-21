import { BodyLocation } from '../../shapes/body';
import { DocumentedBody } from '../../shapes/body';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Schema, SchemaObject } from '../../shapes';
import { Some } from 'ts-results';

export function jsonBody(
  value: any,
  schema: SchemaObject | null = null
): DocumentedBody {
  return {
    body: Some({
      value,
      contentType: 'application/json',
    }),
    shapeLocation: null,
    schema,
    specJsonPath: jsonPointerHelpers.compile(['/documented-body-fixture']),
  };
}

export function jsonBodyInRequest(
  value: any,
  schema: SchemaObject | null
): DocumentedBody {
  return {
    body: Some({
      value,
      contentType: 'application/json',
    }),
    schema,
    shapeLocation: {
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

export function jsonBodyInResponse(
  value: any,
  schema: SchemaObject | null = null
) {
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
