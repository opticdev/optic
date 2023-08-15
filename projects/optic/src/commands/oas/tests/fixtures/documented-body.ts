import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { Some } from 'ts-results';
import { SchemaObject } from '../../../capture/patches/patchers/shapes/schema';
import { DocumentedBody } from '../../../capture/patches/patchers/shapes/documented-bodies';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';

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
    interaction: {
      request: {
        host: '',
        path: '',
        method: OpenAPIV3.HttpMethods.GET,
        body: null,
        headers: [],
        query: [],
      },
    },
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
    interaction: {
      request: {
        host: '',
        path: '',
        method: OpenAPIV3.HttpMethods.GET,
        body: null,
        headers: [],
        query: [],
      },
    },
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
