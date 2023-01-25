import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from 'openapi-types';
import { ObjectDiff, typeofDiff } from '../diff/diff';
import {
  constructFactTree,
  getFactForJsonPath,
} from './json-path-interpreters';
import { getLocation, OpenApiV3Traverser } from './traverser';
import { OpenApiV3TraverserFact } from './types';

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
  diffs: Record<string, Diff[]>;
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
        diffs: {},
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
        diffs: {},
      };
      response.contents[contentType] = responseBody;
      return responseBody;
    }
  }
}

function normalizeRequiredDiff(
  spec: OpenAPIV3.Document,
  fact: OpenApiV3TraverserFact<'body'> | OpenApiV3TraverserFact<'field'>,
  pointers: {
    absolute: string;
    trail: string;
  }
): string[] | null {
  const trailParts = jsonPointerHelpers.decode(pointers.trail);
  const maybeBaseRequiredPath =
    fact.type === 'body' && trailParts[1] === 'required'
      ? jsonPointerHelpers.append(fact.location.jsonPath, 'schema')
      : fact.type === 'field' && trailParts[0] === 'required'
      ? fact.location.jsonPath
      : null;
  const location = getLocation(fact);

  if (!maybeBaseRequiredPath) {
    return null;
  }

  const expectAnArray =
    (fact.type === 'body' && trailParts.length === 2) ||
    (fact.type === 'field' && trailParts.length === 1);
  const expectAString =
    (fact.type === 'body' && trailParts.length === 3) ||
    (fact.type === 'field' && trailParts.length === 2);

  // fetch the required keys
  const raw = jsonPointerHelpers.get(spec, pointers.absolute);

  // Here we'll need to check if the required added is valid and maybe fan out keys to add
  if (
    (Array.isArray(raw) && expectAnArray) ||
    (typeof raw === 'string' && expectAString)
  ) {
    const keysToTest = Array.isArray(raw)
      ? raw.filter((k) => typeof k === 'string')
      : [raw];

    return keysToTest
      .map((k) =>
        jsonPointerHelpers.append(maybeBaseRequiredPath, 'properties', k)
      )
      .filter((p) => jsonPointerHelpers.tryGet(spec, p).match)
      .map((p) =>
        jsonPointerHelpers.relative(
          p,
          fact.location.jsonPath.replace(
            'trail' in location
              ? jsonPointerHelpers.compile(location.trail)
              : '',
            ''
          )
        )
      );
  } else {
    return [];
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
    const fact =
      diff.after !== undefined
        ? getFactForJsonPath(diff.after, toTree)
        : getFactForJsonPath(diff.before, fromTree);
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
      } else if (fact.type === 'body-example') {
        const location = getLocation(fact);

        const endpointId = getEndpointId(location);
        const key = jsonPointerHelpers.compile(location.trail);
        const body =
          location.location === 'request'
            ? grouped.getOrSetRequestBody(endpointId, location.contentType)
            : grouped.getOrSetResponseBody(
                endpointId,
                location.statusCode,
                location.contentType
              );

        if (body.diffs[key]) {
          body.diffs[key].push(diffToAdd);
        } else {
          body.diffs[key] = [diffToAdd];
        }
      } else if (fact.type === 'body' || fact.type === 'field') {
        const location = getLocation(fact);
        const endpointId = getEndpointId(location);
        const body =
          location.location === 'request'
            ? grouped.getOrSetRequestBody(endpointId, location.contentType)
            : grouped.getOrSetResponseBody(
                endpointId,
                location.statusCode,
                location.contentType
              );

        const specToFetchFrom =
          diff.after !== undefined ? specs.to : specs.from;

        let fieldKeys = normalizeRequiredDiff(specToFetchFrom, fact, {
          absolute: diff.after ?? diff.before,
          trail,
        }) ?? [
          'trail' in location ? jsonPointerHelpers.compile(location.trail) : '',
        ];

        for (const fieldKey of fieldKeys) {
          if (body.diffs[fieldKey]) {
            body.diffs[fieldKey].push(diffToAdd);
          } else {
            body.diffs[fieldKey] = [diffToAdd];
          }
        }
      }
    }
  }

  return grouped;
}
