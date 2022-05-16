import { OpenApiKind, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  Operation,
  Specification,
  RequestBody,
  Response,
  FactVariantWithRaw,
  ResponseBody,
} from '../types';
import {
  OpenApiDocument,
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
): Map<string, FactVariantWithRaw<T>> => {
  const factsWithRaw: Map<string, FactVariantWithRaw<T>> = new Map();

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

  return {
    ...operationFact,
    raw: jsonPointerHelpers.get(openApiSpec, operationFact.location.jsonPath),
    path: endpoint.path,
    method: endpoint.method,
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
  specificationNode: OpenApiDocument['specification'],
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
