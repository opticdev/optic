/**
 * data-constructors take a Node from OpenAPIFactNodes and a before / after spec
 * to construct it into a user facing data structure used in `matches` blocks and `rule assertions`
 * some examples of these user facing data structures are `Operation`, `Specification`, `Response`
 */
import {
  OpenApiKind,
  OpenAPIV3,
  FactVariant,
} from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  Operation,
  Specification,
  RequestBody,
  Response,
  ResponseBody,
} from '../types';
import {
  OpenAPIFactNodes,
  EndpointNode,
  RequestNode,
  ResponseNode,
  NodeDetail,
  BodyNode,
} from './rule-runner-types';

type SpecFactsFrom = 'before' | 'after';

const createFactsWithRaw = <T extends OpenApiKind>(
  nodeDetailMap: Map<string, NodeDetail<T>>,
  key: SpecFactsFrom,
  openApiSpec: OpenAPIV3.Document
): Map<string, FactVariant<T> & { raw: any }> => {
  const factsWithRaw: Map<string, FactVariant<T> & { raw: any }> = new Map();

  for (const [name, nodeDetail] of nodeDetailMap.entries()) {
    const nodeFact = nodeDetail[key];
    if (nodeFact) {
      factsWithRaw.set(name, {
        ...nodeFact,
        raw: jsonPointerHelpers.get(openApiSpec, nodeFact.location.jsonPath),
      });
    }
  }

  return factsWithRaw;
};

export const createRequest = (
  request: RequestNode,
  contentType: string,
  key: SpecFactsFrom,
  openApiSpec: OpenAPIV3.Document
): RequestBody | null => {
  const requestFact = request[key];
  const requestBody = request.bodies.get(contentType);
  const requestBodyFact = requestBody?.[key];
  if (!requestFact || !requestBody || !requestBodyFact) {
    return null;
  }

  return {
    ...requestBodyFact,
    raw: jsonPointerHelpers.get(openApiSpec, requestBodyFact.location.jsonPath),
    contentType,
    properties: createFactsWithRaw(requestBody.fields, key, openApiSpec),
  };
};

export const createResponse = (
  response: ResponseNode,
  key: SpecFactsFrom,
  openApiSpec: OpenAPIV3.Document
): Response | null => {
  const responseFact = response[key];
  if (!responseFact) {
    return null;
  }

  const bodies: ResponseBody[] = [];
  for (const [contentType, bodyNode] of response.bodies.entries()) {
    const responseBody = createResponseBody(
      bodyNode,
      response.statusCode,
      contentType,
      key,
      openApiSpec
    );

    if (responseBody) {
      bodies.push(responseBody);
    }
  }

  return {
    ...responseFact,
    raw: jsonPointerHelpers.get(openApiSpec, responseFact.location.jsonPath),
    statusCode: response.statusCode,
    bodies,
    headers: createFactsWithRaw(response.headers, key, openApiSpec),
  };
};

export const createResponseBody = (
  bodyNode: BodyNode,
  statusCode: string,
  contentType: string,
  key: SpecFactsFrom,
  openApiSpec: OpenAPIV3.Document
): ResponseBody | null => {
  const responseBodyFact = bodyNode?.[key];
  if (!responseBodyFact) {
    return null;
  }

  return {
    ...responseBodyFact,
    raw: jsonPointerHelpers.get(
      openApiSpec,
      responseBodyFact.location.jsonPath
    ),
    contentType,
    statusCode: statusCode,
    properties: createFactsWithRaw(bodyNode.fields, key, openApiSpec),
  };
};

export const createOperation = (
  endpoint: EndpointNode,
  key: SpecFactsFrom,
  openApiSpec: OpenAPIV3.Document
): Operation | null => {
  const operationFact = endpoint[key];

  if (!operationFact) {
    return null;
  }

  const requests: RequestBody[] = [];
  const responses = new Map<string, Response>();

  for (const contentType of endpoint.request.bodies.keys()) {
    const request = createRequest(
      endpoint.request,
      contentType,
      key,
      openApiSpec
    );
    if (request) {
      requests.push(request);
    }
  }

  for (const responseNode of endpoint.responses.values()) {
    const response = createResponse(
      responseNode,

      key,
      openApiSpec
    );
    if (response) {
      responses.set(responseNode.statusCode, response);
    }
  }

  const security: OpenAPIV3.OperationObject['security'] | null = (() => {
    const operationOverride = jsonPointerHelpers.tryGet(
      openApiSpec,
      jsonPointerHelpers.append(operationFact.location.jsonPath, 'security')
    );

    if (operationOverride.match)
      return operationOverride.value as OpenAPIV3.OperationObject['security'];

    const specLevel = jsonPointerHelpers.tryGet(openApiSpec, '/security');

    if (specLevel.match)
      return specLevel.value as OpenAPIV3.OperationObject['security'];

    return null;
  })();

  return {
    ...operationFact,
    polymorphicSchemas: endpoint.polymorphicSchemas,
    raw: jsonPointerHelpers.get(openApiSpec, operationFact.location.jsonPath),
    path: endpoint.path,
    method: endpoint.method,
    security,
    headerParameters: createFactsWithRaw(
      endpoint.headerParameters,
      key,
      openApiSpec
    ),
    queryParameters: createFactsWithRaw(
      endpoint.queryParameters,
      key,
      openApiSpec
    ),
    pathParameters: createFactsWithRaw(
      endpoint.pathParameters,
      key,
      openApiSpec
    ),
    cookieParameters: createFactsWithRaw(
      endpoint.cookieParameters,
      key,
      openApiSpec
    ),
    requests,
    responses,
  };
};

export const createSpecification = (
  specificationNode: OpenAPIFactNodes['specification'],
  key: SpecFactsFrom,
  openApiSpec: OpenAPIV3.Document
): Specification | null => {
  const specificationFact = specificationNode[key];
  if (!specificationFact) {
    return null;
  }

  return {
    ...specificationFact,
    raw: openApiSpec,
  };
};
