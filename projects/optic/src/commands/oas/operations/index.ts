import { CapturedInteraction } from '../captures';
import { OpenAPIV3 } from '../specs';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import invariant from 'ts-invariant';
import MIMEType from 'whatwg-mimetype';

export { DocumentedInteractions } from './streams/documented-interactions';
export { OperationPatches } from './streams/patches';
export { OperationPatch } from './patches';
export { UndocumentedOperations } from './streams/undocumented';

export interface Operation extends OpenAPIV3.OperationObject {
  pathPattern: string;
  method: OpenAPIV3.HttpMethods;

  requestBody?: OpenAPIV3.RequestBodyObject;
  responses: { [code: string]: OpenAPIV3.ResponseObject };
}

export class Operation {
  static fromOperationObject(
    pathPattern: string,
    method: OpenAPIV3.HttpMethods,
    operation: OpenAPIV3.OperationObject
  ): Operation {
    const requestBody = operation.requestBody;
    invariant(
      !requestBody || isNotReferenceObject(requestBody),
      `operation expected to not have any references, found in request body, pathPattern=${pathPattern} method=${method}`
    );

    const responses = Object.fromEntries(
      Object.entries(operation.responses).map(([code, response]) => {
        invariant(
          isNotReferenceObject(response),
          `operation expected to not have any reference, found in response, statusCode=${code} pathPattern=${pathPattern} method=${method}`
        );
        return [code, response];
      })
    );

    return {
      pathPattern,
      method,
      ...operation,
      requestBody,
      responses,
    };
  }

  static isHttpMethod(method: string): method is OpenAPIV3.HttpMethods {
    return !!Object.values(HttpMethods).find((m) => m === method);
  }
}

export enum UndocumentedOperationType {
  MissingMethod = 'missing-method',
  MissingPath = 'missing-path',
  MissingPathParameter = 'missing-path-parameter',
}

export type UndocumentedOperation = {
  type: UndocumentedOperationType;
  pathPattern: string;
} & (
  | {
      type: UndocumentedOperationType.MissingMethod;
      specPath: string;
      method: OpenAPIV3.HttpMethods;
    }
  | {
      type: UndocumentedOperationType.MissingPath;
      specPath: string;
      methods: OpenAPIV3.HttpMethods[];
      pathParameters: string[];
    }
  | {
      type: UndocumentedOperationType.MissingPathParameter;
      parameters: OpenAPIV3.ParameterObject[] | null;
      specPath: string;
      parameterName: string;
    }
);

export enum PathComponentKind {
  Literal = 'literal',
  Template = 'template',
}

export interface PathComponent {
  kind: PathComponentKind;
  name: string;
}

export class PathComponent {
  static isTemplate(
    component: PathComponent
  ): component is PathComponent & { kind: PathComponentKind.Template } {
    return component.kind === PathComponentKind.Template;
  }
}

export interface PathComponents extends Array<PathComponent> {}

const fragmentPattern = /{(.+)}/;
export class PathComponents {
  static fromPath(path: string): PathComponents {
    /*
    Copied from https://github.com/stoplightio/prism/blob/0ad49235879ad4f7fcafa7b5badcb763b0c37a6a/packages/http/src/router/matchPath.ts
    under https://github.com/stoplightio/prism/blob/master/LICENSE
   */
    if (path.length === 0 || !path.startsWith('/')) {
      return [];
    }
    return path
      .split('/')
      .slice(1)
      .map(decodePathFragment)
      .map((fragment) => {
        const templateName = fragment.match(fragmentPattern);

        return templateName
          ? {
              kind: PathComponentKind.Template,
              name: templateName[1],
            }
          : {
              kind: PathComponentKind.Literal,
              name: fragment,
            };
      });
  }
}

function decodePathFragment(pathFragment: string) {
  try {
    return pathFragment && decodeURIComponent(pathFragment);
  } catch (_) {
    return pathFragment;
  }
}

export interface DocumentedInteraction {
  interaction: CapturedInteraction;
  operation: Operation;
  specJsonPath: string;
}

export class DocumentedInteraction {
  static updateOperation(
    self: DocumentedInteraction,
    spec: OpenAPIV3.Document
  ) {
    let operationObject = jsonPointerHelpers.get(spec, self.specJsonPath) as
      | OpenAPIV3.OperationObject
      | undefined;
    invariant(
      operationObject,
      'operation object has to exist in spec to update operation of DocumentationInteraction'
    );

    return {
      ...self,
      operation: Operation.fromOperationObject(
        self.operation.pathPattern,
        self.operation.method,
        operationObject
      ),
    };
  }
}

const HttpMethods = OpenAPIV3.HttpMethods;
export { HttpMethods };
export type HttpMethod = OpenAPIV3.HttpMethods;

export function findResponse(
  { responses }: Pick<Operation, 'responses'>,
  statusCode: string
): [OpenAPIV3.ResponseObject, string] | null {
  let exactMatch: [OpenAPIV3.ResponseObject, string] | null = null;
  let rangeMatch: [OpenAPIV3.ResponseObject, string] | null = null;
  let defaultMatch: [OpenAPIV3.ResponseObject, string] | null = null;

  // oldskool for loop, because no object.find and work arounds are messy
  for (let [code, response] of Object.entries(responses)) {
    if (code === statusCode) {
      exactMatch = [response, code];
      break; // exact match found, so we can stop looking
    }

    if (
      !rangeMatch &&
      statusRangePattern.test(statusCode) &&
      statusCode.substring(0, 1) === code.substring(0, 1)
    ) {
      rangeMatch = [response, code];
      continue;
    }

    if (!defaultMatch && code === 'default') {
      defaultMatch = [response, code];
    }

    if (exactMatch && rangeMatch && defaultMatch) break;
  }

  return exactMatch || rangeMatch || defaultMatch;
}

export function findBody(
  bodyObject: {
    content?: { [media: string]: OpenAPIV3.MediaTypeObject };
  },
  contentType?: string | null
): [OpenAPIV3.MediaTypeObject, string] | null {
  if (!contentType) return null;
  if (!bodyObject.content) return null;

  let parsedType = MIMEType.parse(contentType);
  if (!parsedType) return null;
  let normalizedType = parsedType.toString();

  let exactMatch: [OpenAPIV3.MediaTypeObject, string] | null = null;
  let essenceMatch: [OpenAPIV3.MediaTypeObject, string] | null = null;
  let typeRangeMatch: [OpenAPIV3.MediaTypeObject, string] | null = null;
  let rangeMatch: [OpenAPIV3.MediaTypeObject, string] | null = null;

  for (let [rawType, media] of Object.entries(bodyObject.content)) {
    let type = new MIMEType(rawType);
    let normalized = type.toString();

    if (type.toString() === normalizedType) {
      exactMatch = [media, rawType];
      break; // exact match found, lets stop looking
    }

    if (!essenceMatch && type.essence === parsedType.essence) {
      essenceMatch = [media, rawType];
      continue;
    }

    if (
      !typeRangeMatch &&
      type.type === parsedType.type &&
      type.subtype === '*'
    ) {
      typeRangeMatch = [media, rawType];
    }

    if (!rangeMatch && type.type === '*' && type.subtype === '*') {
      rangeMatch = [media, rawType];
    }

    if (exactMatch && essenceMatch && typeRangeMatch && rangeMatch) break;
  }

  return exactMatch || essenceMatch || typeRangeMatch || rangeMatch;
}

export const statusRangePattern = /[245]xx/;

const isNotReferenceObject = <T extends {}>(
  maybeReference: T | OpenAPIV3.ReferenceObject
): maybeReference is Exclude<T, OpenAPIV3.ReferenceObject> => {
  return !('$ref' in maybeReference);
};
