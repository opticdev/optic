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
import { JsonPath } from '@useoptic/openapi-io';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function addResponseForExample(
  patcher: JsonPatcher<OpenAPIV3.Document>,
  responsesMapPointer: JsonPath,
  example: ApiTraffic,
  // differ dependencies
  jsonSchemaDiffer: JsonSchemaJsonDiffer
): { patches: IPatchGroup[] } {
  const targetStatusCode = example.response.statusCode;

  const newContentType: OpenAPIV3.MediaTypeObject = (() => {
    if (
      qualifyJsonDiffer(example.response.body.contentType) &&
      example.response.body.jsonBodyString
    ) {
      const json = JSON.parse(example.response.body.jsonBodyString) || {};
      // could start maintaining examples here too :)
      return {
        schema: streamingJsonSchemaBuilder(jsonSchemaDiffer, json),
      };
    } else {
      return { example: '' };
    }
  })();

  if (!isObject(patcher.helper.get(responsesMapPointer))) {
    patcher.apply('add responses map', [
      {
        op: 'add',
        value: {},
        path: responsesMapPointer,
      },
    ]);
  }

  if (!patcher.helper.getPath(responsesMapPointer, [targetStatusCode])) {
    const response: OpenAPIV3.ResponseObject = {
      description: '',
      content: {},
    };
    patcher.apply(`add ${targetStatusCode} status code`, [
      {
        op: 'add',
        value: response,
        path: jsonPointerHelpers.append(responsesMapPointer, targetStatusCode),
      },
    ]);
  }

  if (
    !patcher.helper.getPath(responsesMapPointer, [targetStatusCode, 'content'])
  ) {
    patcher.apply('add content type map', [
      {
        op: 'add',
        value: {},
        path: jsonPointerHelpers.append(
          responsesMapPointer,
          targetStatusCode,
          'content'
        ),
      },
    ]);
  }

  if (example.response.body.contentType) {
    patcher.apply(
      `add response body content ${example.response.body.contentType}`,
      [
        {
          op: 'add',
          value: newContentType,
          path: jsonPointerHelpers.append(
            responsesMapPointer,
            targetStatusCode,
            'content',
            example.response.body.contentType
          ),
        },
      ]
    );
  }

  return {
    patches: patcher.currentPatches(),
  };
}
