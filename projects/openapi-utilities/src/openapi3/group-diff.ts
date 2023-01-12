import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from 'openapi-types';
import { ObjectDiff, typeofDiff } from '../diff/diff';
import {
  constructFactTree,
  getFactForJsonPath,
} from './json-path-interpreters';
import { getLocation, OpenApiV3Traverser } from './traverser';

function getEndpointId(endpoint: { pathPattern: string; method: string }) {
  const { pathPattern, method } = endpoint;
  return `${pathPattern}.${method.toUpperCase()}`;
}

function constructTree(spec: OpenAPIV3.Document) {
  const traverser = new OpenApiV3Traverser();
  traverser.traverse(spec);

  return constructFactTree([...traverser.facts()]);
}

type Diff = {
  trail: string; // The relative path from the diff to the significant node
  change: 'added' | 'changed' | 'removed';
  before?: string;
  after?: string;
};

type Body = {
  diffs: Diff[];
};

type Response = {
  diffs: Diff[];
  headers: Diff[];
  contents: Record<string, Body>;
};

type Endpoint = {
  diffs: Diff[];
  queryParameters: Diff[];
  pathParameters: Diff[];
  cookieParameters: Diff[];
  headerParameters: Diff[];
  request: {
    diffs: Diff[];
    contents: Record<string, Body>;
  };
  responses: Record<string, Response>;
};

class GroupedDiffs {
  public specification: Diff[];
  public endpoints: Record<string, Endpoint>;
  constructor() {
    this.endpoints = {};
    this.specification = [];
  }

  getOrSetEndpoint(endpointId: string): Endpoint {
    if (this.endpoints[endpointId]) {
      return this.endpoints[endpointId];
    } else {
      const endpoint: Endpoint = {
        diffs: [],
        queryParameters: [],
        pathParameters: [],
        cookieParameters: [],
        headerParameters: [],
        request: {
          diffs: [],
          contents: {},
        },
        responses: {},
      };
      this.endpoints[endpointId] = endpoint;
      return endpoint;
    }
  }

  getOrSetRequestBody(endpointId: string, contentType: string): Body {
    const endpoint = this.getOrSetEndpoint(endpointId);
    if (endpoint.request.contents[contentType]) {
      return endpoint.request.contents[contentType];
    } else {
      const requestBody: Body = {
        diffs: [],
      };
      endpoint.request.contents[contentType] = requestBody;
      return requestBody;
    }
  }

  getOrSetResponse(endpointId: string, statusCode: string): Response {
    const endpoint = this.getOrSetEndpoint(endpointId);

    if (endpoint.responses[statusCode]) {
      return endpoint.responses[statusCode];
    } else {
      const response: Response = {
        diffs: [],
        headers: [],
        contents: {},
      };
      endpoint.responses[statusCode] = response;
      return response;
    }
  }

  getOrSetResponseBody(
    endpointId: string,
    statusCode: string,
    contentType: string
  ): Body {
    const response = this.getOrSetResponse(endpointId, statusCode);
    if (response.contents[contentType]) {
      return response.contents[contentType];
    } else {
      const responseBody: Body = {
        diffs: [],
      };
      response.contents[contentType] = responseBody;
      return responseBody;
    }
  }
}

export function groupDiffsByEndpoint(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  diffs: ObjectDiff[]
) {
  const fromTree = constructTree(specs.from);
  const toTree = constructTree(specs.to);

  const grouped = new GroupedDiffs();

  for (const diff of diffs) {
    const fact = diff.after
      ? getFactForJsonPath(diff.after, toTree)
      : diff.before
      ? getFactForJsonPath(diff.before, fromTree)
      : null;
    if (fact) {
      const trail = jsonPointerHelpers.relative(
        diff.after ?? diff.before,
        fact.location.jsonPath
      );
      const diffToAdd = { ...diff, trail, change: typeofDiff(diff) };
      if (fact.type === 'specification') {
        grouped.specification.push(diffToAdd);
      } else if (fact.type === 'operation') {
        const location = getLocation(fact);
        const endpointId = getEndpointId(location);
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.diffs.push(diffToAdd);
      } else if (fact.type === 'request-header') {
        const location = getLocation(fact);
        const endpointId = getEndpointId(location);
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.headerParameters.push(diffToAdd);
      } else if (fact.type === 'request-query') {
        const location = getLocation(fact);
        const endpointId = getEndpointId(location);
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.queryParameters.push(diffToAdd);
      } else if (fact.type === 'request-cookie') {
        const location = getLocation(fact);
        const endpointId = getEndpointId(location);
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.cookieParameters.push(diffToAdd);
      } else if (fact.type === 'request-path') {
        const location = getLocation(fact);
        const endpointId = getEndpointId(location);
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.pathParameters.push(diffToAdd);
      } else if (fact.type === 'requestBody') {
        const location = getLocation(fact);
        const endpointId = getEndpointId(location);
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.request.diffs.push(diffToAdd);
      } else if (fact.type === 'response') {
        const location = getLocation(fact);
        const endpointId = getEndpointId(location);
        const response = grouped.getOrSetResponse(
          endpointId,
          location.statusCode
        );
        response.diffs.push(diffToAdd);
      } else if (fact.type === 'response-header') {
        const location = getLocation(fact);
        const endpointId = getEndpointId(location);
        const response = grouped.getOrSetResponse(
          endpointId,
          location.statusCode
        );
        response.headers.push(diffToAdd);
      } else if (
        fact.type === 'body' ||
        fact.type === 'field' ||
        fact.type === 'body-example'
      ) {
        const location = getLocation(fact);
        const endpointId = getEndpointId(location);

        if ('trail' in location) {
          // For field locations we need to adjust the trails since each field is considered significant
          diffToAdd.trail = jsonPointerHelpers.compile([
            ...location.trail,
            ...jsonPointerHelpers.decode(diffToAdd.trail),
          ]);
        }
        const body =
          location.location === 'request'
            ? grouped.getOrSetRequestBody(endpointId, location.contentType)
            : grouped.getOrSetResponseBody(
                endpointId,
                location.statusCode,
                location.contentType
              );
        body.diffs.push(diffToAdd);
      }
    }
  }

  return grouped;
}
