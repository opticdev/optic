import { OpenApiKind, OpenAPIV3 } from '@useoptic/openapi-utilities';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import {
  Operation,
  Specification,
  Request,
  Response,
  FactVariantWithRaw,
} from '../types';
import {
  OpenApiDocument,
  EndpointNode,
  RequestNode,
  ResponseNode,
  NodeDetail,
} from './group-facts';

type SpecFactsFrom = 'before' | 'after';

const createFactsWithRaw = <T extends OpenApiKind>(
  nodeDetailMap: Map<string, NodeDetail<T>>,
  key: SpecFactsFrom,
  openApiSpec: OpenAPIV3.Document
): FactVariantWithRaw<T>[] => {
  const factsWithRaw: FactVariantWithRaw<T>[] = [];

  for (const [_, nodeDetail] of nodeDetailMap.entries()) {
    const nodeFact = nodeDetail[key];
    if (nodeFact) {
      factsWithRaw.push({
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
): Request | null => {
  const requestFact = request[key];
  const requestBody = request.bodies.get(contentType);
  const requestBodyFact = requestBody?.[key];
  if (!requestFact || !requestBody || !requestBodyFact) {
    return null;
  }

  return {
    ...requestFact,
    raw: jsonPointerHelpers.get(openApiSpec, requestFact.location.jsonPath),
    contentType,
    body: {
      ...requestBodyFact,
      raw: jsonPointerHelpers.get(
        openApiSpec,
        requestBodyFact.location.jsonPath
      ),
    },
    properties: createFactsWithRaw(requestBody.fields, key, openApiSpec),
  };
};

export const createResponse = (
  response: ResponseNode,
  contentType: string,
  key: SpecFactsFrom,
  openApiSpec: OpenAPIV3.Document
): Response | null => {
  const responseFact = response[key];
  const responseBody = response.bodies.get(contentType);
  const responseBodyFact = responseBody?.[key];
  if (!responseFact || !responseBody || !responseBodyFact) {
    return null;
  }

  return {
    ...responseFact,
    raw: jsonPointerHelpers.get(openApiSpec, responseFact.location.jsonPath),
    contentType,
    statusCode: response.statusCode,
    body: {
      ...responseBodyFact,
      raw: jsonPointerHelpers.get(
        openApiSpec,
        responseBodyFact.location.jsonPath
      ),
    },
    properties: createFactsWithRaw(responseBody.fields, key, openApiSpec),
    // Note that headers are unique per status code, not status code + content type - TODO to see and ensure response headers aren't double triggered by rules
    headers: createFactsWithRaw(response.headers, key, openApiSpec),
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

  const requests: Request[] = [];
  const responses: Response[] = [];

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
    for (const contentType of responseNode.bodies.keys()) {
      const response = createResponse(
        responseNode,
        contentType,
        key,
        openApiSpec
      );
      if (response) {
        responses.push(response);
      }
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
