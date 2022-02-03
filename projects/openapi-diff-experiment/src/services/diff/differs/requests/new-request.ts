import { ApiTraffic } from '../../../traffic/types';
import {
  IPatchGroup,
  JsonPatcher,
} from '../../../patch/incremental-json-patch/json-patcher';
import { JsonSchemaJsonDiffer } from '../json-schema-json-diff/types';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { isObject } from '../../../../utils/is-object';
import { streamingJsonSchemaBuilder } from '../json-schema-json-diff/json-builder/streaming-json-schema-builder';
import { qualifyJsonDiffer } from '../../qualify-schema-differs';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function addRequestBodyForExample(
  patcher: JsonPatcher<OpenAPIV3.Document>,
  operationPointer: string,
  example: ApiTraffic,
  // differ dependencies
  jsonSchemaDiffer: JsonSchemaJsonDiffer
): { patches: IPatchGroup[] } {
  // bail if no request body
  if (!example.requestBody || !example.requestBody.contentType) {
    return {
      patches: patcher.currentPatches(),
    };
  }

  const newContentType: OpenAPIV3.MediaTypeObject = (() => {
    if (
      qualifyJsonDiffer(example.requestBody.contentType) &&
      example.requestBody.jsonBodyString
    ) {
      const json = JSON.parse(example.requestBody.jsonBodyString) || {};
      // could start maintaining examples here too :)
      return {
        schema: streamingJsonSchemaBuilder(jsonSchemaDiffer, json),
      };
    } else {
      return { example: '' };
    }
  })();

  const requestBodyPointer = jsonPointerHelpers.append(
    operationPointer,
    'requestBody'
  );

  const requestBodyContentPath = jsonPointerHelpers.append(
    requestBodyPointer,
    'content'
  );

  const requestBodyContentTypePath = jsonPointerHelpers.append(
    requestBodyContentPath,
    example.requestBody.contentType
  );

  const requestBodyObject: OpenAPIV3.RequestBodyObject = {
    description: '',
    required: true,
    content: {},
  };

  if (!isObject(patcher.helper.get(requestBodyPointer))) {
    patcher.apply(`add requestBody to operation`, [
      {
        op: 'add',
        value: requestBodyObject,
        path: requestBodyPointer,
      },
    ]);
  }

  if (!isObject(patcher.helper.get(requestBodyContentPath))) {
    patcher.apply(`add content {} to requestBody`, [
      {
        op: 'add',
        value: {},
        path: requestBodyContentPath,
      },
    ]);
  }

  if (!isObject(patcher.helper.get(requestBodyContentTypePath))) {
    const body: OpenAPIV3.RequestBodyObject['content']['application/json'] =
      newContentType;

    patcher.apply(`add ${example.requestBody.contentType} to request body`, [
      {
        op: 'add',
        value: body,
        path: requestBodyContentTypePath,
      },
    ]);
  }

  return {
    patches: patcher.currentPatches(),
  };
}
