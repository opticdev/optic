import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from 'openapi-types';
import { ObjectDiff, typeofDiff } from '../diff/diff';
import {
  constructFactTree,
  getFactForJsonPath,
} from './json-path-interpreters';
import { getLocation, OpenApiV3Traverser } from './traverser';

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
  public paths: Record<
    string,
    {
      diffs: Diff[];
      methods: Record<string, Endpoint>;
    }
  >;
  constructor() {
    this.paths = {};
    this.specification = [];
  }

  getOrSetPath(path: string): {
    diffs: Diff[];
    methods: Record<string, Endpoint>;
  } {
    if (this.paths[path]) {
      return this.paths[path];
    } else {
      const pathObject = {
        diffs: [],
        methods: {},
      };
      this.paths[path] = pathObject;
      return pathObject;
    }
  }

  getOrSetEndpoint(path: string, method: string): Endpoint {
    const pathObject = this.getOrSetPath(path);
    const methodLower = method.toLowerCase();
    if (pathObject.methods[methodLower]) {
      return pathObject.methods[methodLower];
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
      pathObject.methods[methodLower] = endpoint;
      return endpoint;
    }
  }

  getOrSetRequestBody(path: string, method: string, contentType: string): Body {
    const endpoint = this.getOrSetEndpoint(path, method);
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

  getOrSetResponse(path: string, method: string, statusCode: string): Response {
    const endpoint = this.getOrSetEndpoint(path, method);

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
    path: string,
    method: string,
    statusCode: string,
    contentType: string
  ): Body {
    const response = this.getOrSetResponse(path, method, statusCode);
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
        const { pathPattern } = getLocation(fact);
        const path = grouped.getOrSetPath(pathPattern);
        path.diffs.push(diffToAdd);
      } else if (fact.type === 'operation') {
        const { pathPattern, method } = getLocation(fact);
        const endpoint = grouped.getOrSetEndpoint(pathPattern, method);
        endpoint.diffs.push(diffToAdd);
      } else if (fact.type === 'request-header') {
        const { pathPattern, method } = getLocation(fact);
        const endpoint = grouped.getOrSetEndpoint(pathPattern, method);
        endpoint.headerParameters.push(diffToAdd);
      } else if (fact.type === 'request-query') {
        const { pathPattern, method } = getLocation(fact);
        const endpoint = grouped.getOrSetEndpoint(pathPattern, method);
        endpoint.queryParameters.push(diffToAdd);
      } else if (fact.type === 'request-cookie') {
        const { pathPattern, method } = getLocation(fact);
        const endpoint = grouped.getOrSetEndpoint(pathPattern, method);
        endpoint.cookieParameters.push(diffToAdd);
      } else if (fact.type === 'request-path') {
        const { pathPattern, method } = getLocation(fact);
        const endpoint = grouped.getOrSetEndpoint(pathPattern, method);
        endpoint.pathParameters.push(diffToAdd);
      } else if (fact.type === 'requestBody') {
        const { pathPattern, method } = getLocation(fact);
        const endpoint = grouped.getOrSetEndpoint(pathPattern, method);
        endpoint.request.diffs.push(diffToAdd);
      } else if (fact.type === 'response') {
        const { pathPattern, method, statusCode } = getLocation(fact);
        const response = grouped.getOrSetResponse(
          pathPattern,
          method,
          statusCode
        );
        response.diffs.push(diffToAdd);
      } else if (fact.type === 'response-header') {
        const { pathPattern, method, statusCode } = getLocation(fact);
        const response = grouped.getOrSetResponse(
          pathPattern,
          method,
          statusCode
        );
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
        const body =
          location.location === 'request'
            ? grouped.getOrSetRequestBody(
                location.pathPattern,
                location.method,
                location.contentType
              )
            : grouped.getOrSetResponseBody(
                location.pathPattern,
                location.method,
                location.statusCode,
                location.contentType
              );
        body.diffs.push(diffToAdd);
      }
    }
  }

  return grouped;
}
