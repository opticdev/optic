import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from 'openapi-types';
import { ObjectDiff, typeofDiff } from '../diff/diff';
import {
  constructFactTree,
  getFactForJsonPath,
} from './json-path-interpreters';
import { getLocation, getRaw, OpenApiV3Traverser } from './traverser';

const SEPARATOR = '-~_~-';

function getEndpointId({
  pathPattern,
  method,
}: {
  pathPattern: string;
  method: string;
}) {
  return `${pathPattern}${SEPARATOR}${method.toUpperCase()}`;
}

function constructTree(spec: OpenAPIV3.Document) {
  const traverser = new OpenApiV3Traverser();
  traverser.traverse(spec);

  return constructFactTree([...traverser.facts()]);
}

export type Diff = {
  trail: string; // The relative path from the diff to the significant node
  change: 'added' | 'changed' | 'removed';
} & (
  | {
      before?: undefined;
      after: string;
    }
  | {
      before: string;
      after: string;
    }
  | {
      before: string;
      after?: undefined;
    }
);

export type Body = {
  diffs: Diff[];
};

export type Response = {
  diffs: Diff[];
  headers: Diff[];
  contents: Record<string, Body>;
};

export type Endpoint = {
  method: string;
  path: string;
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

export class GroupedDiffs {
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
      const [path, method] = endpointId.split(SEPARATOR);
      const endpoint: Endpoint = {
        method,
        path,
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
      } else if (fact.type === 'path') {
        // We have a path fact, but we don't want to have to keep looking up each diff, so we'll "convert" the raw diff
        // and just emit endpoint diffs
        const { pathPattern } = getLocation(fact);
        if (diff.before !== undefined && diff.after === undefined) {
          const rawPathObject = jsonPointerHelpers.get(specs.from, diff.before);
          for (const method of Object.keys(rawPathObject)) {
            if (Object.values(OpenAPIV3.HttpMethods).includes(method as any)) {
              const newDiff: Diff = {
                before: jsonPointerHelpers.append(diff.before, method),
                trail: '',
                change: 'removed',
              };
              const endpointId = getEndpointId({ pathPattern, method });
              const endpoint = grouped.getOrSetEndpoint(endpointId);
              endpoint.diffs.push(newDiff);
            }
          }
        } else if (diff.before === undefined && diff.after !== undefined) {
          const rawPathObject = jsonPointerHelpers.get(specs.to, diff.after);
          for (const method of Object.keys(rawPathObject)) {
            if (Object.values(OpenAPIV3.HttpMethods).includes(method as any)) {
              const newDiff: Diff = {
                after: jsonPointerHelpers.append(diff.after, method),
                trail: '',
                change: 'added',
              };
              const endpointId = getEndpointId({ pathPattern, method });
              const endpoint = grouped.getOrSetEndpoint(endpointId);
              endpoint.diffs.push(newDiff);
            }
          }
        }
      } else if (fact.type === 'operation') {
        const { pathPattern, method } = getLocation(fact);
        const endpointId = getEndpointId({ pathPattern, method });
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.diffs.push(diffToAdd);
      } else if (fact.type === 'request-header') {
        const { pathPattern, method } = getLocation(fact);
        const endpointId = getEndpointId({ pathPattern, method });
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.headerParameters.push(diffToAdd);
      } else if (fact.type === 'request-query') {
        const { pathPattern, method } = getLocation(fact);
        const endpointId = getEndpointId({ pathPattern, method });
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.queryParameters.push(diffToAdd);
      } else if (fact.type === 'request-cookie') {
        const { pathPattern, method } = getLocation(fact);
        const endpointId = getEndpointId({ pathPattern, method });
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.cookieParameters.push(diffToAdd);
      } else if (fact.type === 'request-path') {
        const { pathPattern, method } = getLocation(fact);
        const endpointId = getEndpointId({ pathPattern, method });
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.pathParameters.push(diffToAdd);
      } else if (fact.type === 'requestBody') {
        const { pathPattern, method } = getLocation(fact);
        const endpointId = getEndpointId({ pathPattern, method });
        const endpoint = grouped.getOrSetEndpoint(endpointId);
        endpoint.request.diffs.push(diffToAdd);
      } else if (fact.type === 'response') {
        const { pathPattern, method, statusCode } = getLocation(fact);
        const endpointId = getEndpointId({ pathPattern, method });
        const response = grouped.getOrSetResponse(endpointId, statusCode);
        response.diffs.push(diffToAdd);
      } else if (fact.type === 'response-header') {
        const { pathPattern, method, statusCode } = getLocation(fact);
        const endpointId = getEndpointId({ pathPattern, method });
        const response = grouped.getOrSetResponse(endpointId, statusCode);
        response.headers.push(diffToAdd);
      } else if (
        fact.type === 'body' ||
        fact.type === 'field' ||
        fact.type === 'body-example'
      ) {
        const location = getLocation(fact);

        if ('trail' in location) {
          // For field locations we need to adjust the trails since each field is considered significant
          diffToAdd.trail = jsonPointerHelpers.compile([
            ...location.trail,
            ...jsonPointerHelpers.decode(diffToAdd.trail),
          ]);
        }
        const endpointId = getEndpointId(location);
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
