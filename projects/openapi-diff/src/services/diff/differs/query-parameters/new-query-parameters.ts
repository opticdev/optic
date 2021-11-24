import {
  IPatchGroup,
  JsonPatcher,
} from '../../../patch/incremental-json-patch/json-patcher';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { JsonPath } from '@useoptic/openapi-io';
import { ApiTraffic } from '../../../traffic/types';
import { parseQueryStringToMap } from './optic-query-string-parser';
import { opticJsonSchemaDiffer } from '../json-schema-json-diff';
import { streamingJsonSchemaBuilder } from '../json-schema-json-diff/json-builder/streaming-json-schema-builder';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

export function newAddAllQueryParameters(
  patcher: JsonPatcher<OpenAPIV3.Document>,
  method: OpenAPIV3.HttpMethods,
  path: string,
  example: ApiTraffic
) {
  const queryParams = parseQueryStringToMap(example.queryString);

  const newParameters: OpenAPIV3.ParameterObject[] = Object.entries(
    queryParams
  ).map((queryObservation) => {
    const [name, value] = queryObservation;

    // start all query params as false
    return newQueryParameter(name, value as any, false);
  });

  if (newParameters.length > 0) {
    const current = patcher.currentDocument();
    const parametersPath = jsonPointerHelpers.compile([
      'paths',
      path,
      method,
      'parameters',
    ]);

    //ensure parameters array exists
    const parametersArray = jsonPointerHelpers.tryGet(current, parametersPath);
    if (
      !parametersArray.match ||
      (parametersArray.match && !Array.isArray(parametersArray.value))
    ) {
      patcher.apply(`add parameters array for ${method} ${path}`, [
        {
          op: 'add',
          path: parametersPath,
          value: [],
        },
      ]);
    }

    newParameters.forEach((param) => {
      const conflict = Boolean(
        parametersArray.match &&
          parametersArray.value.find(
            (i: OpenAPIV3.ParameterObject) =>
              i.name === param.name && i.in === 'query'
          )
      );
      if (!conflict) {
        patcher.apply(`add parameters array for ${method} ${path}`, [
          {
            op: 'add',
            path: jsonPointerHelpers.append(parametersPath, '-'),
            value: param,
          },
        ]);
      }
    });
  }
}

export function newQueryParameter(
  name: string,
  // will eventually include arrays and objects
  value: string | boolean | number,
  required: boolean
): OpenAPIV3.ParameterObject {
  const schema = streamingJsonSchemaBuilder(opticJsonSchemaDiffer(), value);
  return {
    name,
    required,
    schema,
    in: 'query',
  };
}

export function patchAdditionalQueryParameter(
  patcher: JsonPatcher<OpenAPIV3.Document>,
  method: OpenAPIV3.HttpMethods,
  path: string,
  name: string,
  exampleValue: string | boolean | number
) {
  const current = patcher.currentDocument();
  const parametersPath = jsonPointerHelpers.compile([
    'paths',
    path,
    method,
    'parameters',
  ]);

  const param = newQueryParameter(name, exampleValue, false);

  //ensure parameters array exists
  const parametersArray = jsonPointerHelpers.tryGet(current, parametersPath);
  if (
    !parametersArray.match ||
    (parametersArray.match && !Array.isArray(parametersArray.value))
  ) {
    patcher.apply(`add parameters array for ${method} ${path}`, [
      {
        op: 'add',
        path: parametersPath,
        value: [],
      },
    ]);
  }

  const conflict = Boolean(
    parametersArray.match &&
      parametersArray.value.find(
        (i: OpenAPIV3.ParameterObject) => i.name === name && i.in === 'query'
      )
  );
  if (!conflict) {
    patcher.apply(`add parameters array for ${method} ${path}`, [
      {
        op: 'add',
        path: jsonPointerHelpers.append(parametersPath, '-'),
        value: param,
      },
    ]);
  }
}
