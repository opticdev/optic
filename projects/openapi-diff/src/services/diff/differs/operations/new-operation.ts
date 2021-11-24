import { IDiffService } from '../../types';
import {
  IPatchGroup,
  JsonPatcher,
} from '../../../patch/incremental-json-patch/json-patcher';
import { pathParameterNamesForPathPattern } from '../url-path-diff';
import { JsonSchemaJsonDiffer } from '../json-schema-json-diff/types';
import { ApiTraffic } from '../../../traffic/types';
import { addResponseForExample } from '../responses/new-response';
import { OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { newAddAllQueryParameters } from '../query-parameters/new-query-parameters';

export function addNewOperation(
  patcher: JsonPatcher<OpenAPIV3.Document>,
  pathPattern: string,
  method: OpenAPIV3.HttpMethods,
  example: ApiTraffic,
  // differ dependencies
  jsonSchemaDiffer: JsonSchemaJsonDiffer
): { operation: OpenAPIV3.OperationObject; patches: IPatchGroup[] } {
  const pathParams = pathParameterNamesForPathPattern(pathPattern);
  const parameters: OpenAPIV3.ParameterObject[] = pathParams.map((param) => {
    return {
      in: 'path',
      required: true,
      name: param,
      schema: { type: 'string' },
    };
  });

  const current1 = patcher.currentDocument();
  const pathsPointer = jsonPointerHelpers.compile(['paths', pathPattern]);

  if (!current1.paths.hasOwnProperty(pathPattern)) {
    const addPathWithParameters: OpenAPIV3.PathItemObject = {
      parameters,
    };

    patcher.apply(`add path ${pathPattern}`, [
      {
        op: 'add',
        path: pathsPointer,
        value: addPathWithParameters,
      },
    ]);
  }

  const current2 = patcher.currentDocument();
  const operationPointer = jsonPointerHelpers.compile([
    'paths',
    pathPattern,
    method.toLowerCase(),
  ]);

  if (!current2.paths[pathPattern].hasOwnProperty(method.toLowerCase())) {
    const pathLevelParameters = (current2.paths[pathPattern].parameters ||
      []) as OpenAPIV3.ParameterObject[];

    const alreadySpecifiedInGlobal = parameters.every((i) =>
      pathLevelParameters.some((gp) => gp.in === 'path' && gp.name === i.name)
    );

    const addPathWithParameters: OpenAPIV3.OperationObject = {
      parameters: alreadySpecifiedInGlobal ? [] : [...parameters],
      responses: {},
    };

    patcher.apply(`add operation ${method} ${pathPattern}`, [
      {
        op: 'add',
        path: operationPointer,
        value: addPathWithParameters,
      },
    ]);
  }

  // init children
  addResponseForExample(
    patcher,
    jsonPointerHelpers.append(operationPointer, 'responses'),
    example,
    jsonSchemaDiffer
  );

  newAddAllQueryParameters(patcher, method, pathPattern, example);

  return {
    operation: jsonPointerHelpers.get(
      patcher.currentDocument(),
      operationPointer
    ),
    patches: patcher.currentPatches(),
  };
}
