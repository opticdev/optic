import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { OpenAPIV3 } from 'openapi-types';
import { ObjectDiff, typeofDiff } from '../diff/diff';
import {
  constructFactTree,
  getFactForJsonPath,
} from './json-path-interpreters';
import { getLocation, OpenApiV3Traverser } from './traverser';
import { OpenApiV3TraverserFact, V3FactType } from './types';
import { RuleResult } from '../results';
import { getPathAndMethodFromEndpointId, getEndpointId } from '../utilities/id';

function constructTree(spec: OpenAPIV3.Document) {
  const traverser = new OpenApiV3Traverser();
  traverser.traverse(spec);

  return constructFactTree([...traverser.facts()]);
}

export function typeofV3Diffs(diffs: Diff[]) {
  for (const diff of diffs) {
    if (diff.trail === '') {
      return typeofDiff(diff);
    }
  }
  return diffs.length > 0 ? 'changed' : null;
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

type DiffAndRules = {
  diffs: Diff[];
  rules: (RuleResult & { trail: string })[];
};

export type Body = {
  fields: Record<string, DiffAndRules>;
  examples: DiffAndRules;
};

export type Response = {
  diffs: Diff[];
  rules: RuleResult[];
  headers: Record<string, DiffAndRules>;
  contents: Record<string, Body>;
};

export type Endpoint = {
  method: string;
  path: string;
  diffs: Diff[];
  rules: RuleResult[];
  queryParameters: Record<string, DiffAndRules>;
  pathParameters: Record<string, DiffAndRules>;
  cookieParameters: Record<string, DiffAndRules>;
  headerParameters: Record<string, DiffAndRules>;
  request: {
    diffs: Diff[];
    rules: RuleResult[];
    contents: Record<string, Body>;
  };
  responses: Record<string, Response>;
};

export function getEndpointDiffs(endpoint: Endpoint) {
  const items = [
    ...endpoint.diffs,
    ...endpoint.request.diffs,
    ...[
      ...Object.values(endpoint.queryParameters),
      ...Object.values(endpoint.cookieParameters),
      ...Object.values(endpoint.pathParameters),
      ...Object.values(endpoint.headerParameters),
    ].flatMap((r) => r.diffs),
  ];
  for (const content of Object.values(endpoint.request.contents)) {
    items.push(...content.examples.diffs);
    items.push(...Object.values(content.fields).flatMap((r) => r.diffs));
  }
  for (const response of Object.values(endpoint.responses)) {
    items.push(
      ...response.diffs,
      ...Object.values(response.headers).flatMap((r) => r.diffs)
    );
    for (const content of Object.values(response.contents)) {
      items.push(...content.examples.diffs);
      items.push(...Object.values(content.fields).flatMap((r) => r.diffs));
    }
  }
  return items;
}

export function getEndpointRules(endpoint: Endpoint) {
  const items = [
    ...endpoint.rules,
    ...endpoint.request.rules,
    ...[
      ...Object.values(endpoint.queryParameters),
      ...Object.values(endpoint.cookieParameters),
      ...Object.values(endpoint.pathParameters),
      ...Object.values(endpoint.headerParameters),
    ].flatMap((r) => r.rules),
  ];
  for (const content of Object.values(endpoint.request.contents)) {
    items.push(...content.examples.rules);
    items.push(...Object.values(content.fields).flatMap((r) => r.rules));
  }
  for (const response of Object.values(endpoint.responses)) {
    items.push(
      ...response.rules,
      ...Object.values(response.headers).flatMap((r) => r.rules)
    );
    for (const content of Object.values(response.contents)) {
      items.push(...content.examples.rules);
      items.push(...Object.values(content.fields).flatMap((r) => r.rules));
    }
  }
  return items;
}

export class GroupedDiffs {
  public specification: DiffAndRules;
  public endpoints: Record<string, Endpoint>;
  public unmatched: DiffAndRules;
  constructor() {
    this.endpoints = {};
    this.specification = { diffs: [], rules: [] };
    this.unmatched = { diffs: [], rules: [] };
  }

  getOrSetEndpoint(endpointId: string): Endpoint {
    if (this.endpoints[endpointId]) {
      return this.endpoints[endpointId];
    } else {
      const { path, method } = getPathAndMethodFromEndpointId(endpointId);
      const endpoint: Endpoint = {
        method,
        path,
        diffs: [],
        rules: [],
        queryParameters: {},
        pathParameters: {},
        cookieParameters: {},
        headerParameters: {},
        request: {
          diffs: [],
          rules: [],
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
        fields: {},
        examples: { diffs: [], rules: [] },
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
        rules: [],
        headers: {},
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
        fields: {},
        examples: { diffs: [], rules: [] },
      };
      response.contents[contentType] = responseBody;
      return responseBody;
    }
  }
}

function getParameterName(spec: OpenAPIV3.Document, pointer: string) {
  // /paths/path/method/parameters/n
  const parts = jsonPointerHelpers.decode(pointer);
  const basePointer =
    parts[2] === 'parameters'
      ? jsonPointerHelpers.compile(parts.slice(0, 4))
      : jsonPointerHelpers.compile(parts.slice(0, 5));

  const raw = jsonPointerHelpers.get(spec, basePointer);

  return raw.name;
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
  const bodyPath = fact.location.jsonPath.replace(
    'trail' in location ? jsonPointerHelpers.compile(location.trail) : '',
    ''
  );

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
      .map((p) => jsonPointerHelpers.relative(p, bodyPath));
  } else {
    return [];
  }
}

export function groupDiffsByEndpoint(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  diffs: ObjectDiff[],
  rules: RuleResult[]
) {
  const fromTree = constructTree(specs.from);
  const toTree = constructTree(specs.to);

  const grouped = new GroupedDiffs();
  const diffsAndRulesToAdd: (
    | {
        type: 'diffs';
        fact: OpenApiV3TraverserFact<V3FactType>;
        item: Diff;
        spec: OpenAPIV3.Document;
      }
    | {
        type: 'rules';
        item: RuleResult & { trail: string };
        fact: OpenApiV3TraverserFact<V3FactType>;
        spec: OpenAPIV3.Document;
      }
  )[] = [];

  for (const diff of diffs) {
    const fact =
      diff.after !== undefined
        ? getFactForJsonPath(diff.after, toTree)
        : getFactForJsonPath(diff.before, fromTree);

    const isComponentDiff = /^\/components/i.test(diff.after ?? diff.before);

    if (fact && !isComponentDiff) {
      const specToFetchFrom = diff.after !== undefined ? specs.to : specs.from;
      const trail = jsonPointerHelpers.relative(
        diff.after ?? diff.before,
        fact.location.jsonPath
      );
      const diffToAdd = { ...diff, trail, change: typeofDiff(diff) };
      diffsAndRulesToAdd.push({
        type: 'diffs',
        item: diffToAdd,
        spec: specToFetchFrom,
        fact,
      });
    } else {
      const diffToAdd = {
        ...diff,
        trail: diff.after ?? diff.before,
        change: typeofDiff(diff),
      };
      grouped.unmatched.diffs.push(diffToAdd);
    }
  }

  for (const rule of rules) {
    const fact =
      rule.location.spec === 'after'
        ? getFactForJsonPath(rule.location.jsonPath, toTree)
        : getFactForJsonPath(rule.location.jsonPath, fromTree);

    const isComponentDiff = /^\/components/i.test(rule.location.jsonPath);
    if (fact && !isComponentDiff) {
      const trail = jsonPointerHelpers.relative(
        rule.location.jsonPath,
        fact.location.jsonPath
      );
      const specToFetchFrom =
        rule.location.spec === 'after' ? specs.to : specs.from;
      diffsAndRulesToAdd.push({
        type: 'rules',
        item: {
          ...rule,
          trail,
        },
        spec: specToFetchFrom,
        fact,
      });
    } else {
      const ruleToAdd = { ...rule, trail: rule.location.jsonPath };
      grouped.unmatched.rules.push(ruleToAdd);
    }
  }

  for (const node of diffsAndRulesToAdd) {
    const { fact, item, type, spec: specToFetchFrom } = node;
    if (fact.type === 'specification') {
      type === 'diffs'
        ? grouped.specification.diffs.push(item)
        : grouped.specification.rules.push(item);
    } else if (fact.type === 'path') {
      // We have a path fact, but we don't want to have to keep looking up each diff, so we'll "convert" the raw diff
      // and just emit endpoint diffs
      if (type === 'diffs') {
        const { pathPattern } = getLocation(fact);
        if (item.before !== undefined && item.after === undefined) {
          const rawPathObject = jsonPointerHelpers.get(specs.from, item.before);
          if (typeof rawPathObject !== 'object' || rawPathObject === null)
            continue;
          for (const method of Object.keys(rawPathObject)) {
            if (Object.values(OpenAPIV3.HttpMethods).includes(method as any)) {
              const newDiff: Diff = {
                before: jsonPointerHelpers.append(item.before, method),
                trail: '',
                change: 'removed',
              };
              const endpointId = getEndpointId({ path: pathPattern, method });
              const endpoint = grouped.getOrSetEndpoint(endpointId);
              endpoint.diffs.push(newDiff);
            }
          }
        } else if (item.before === undefined && item.after !== undefined) {
          const rawPathObject = jsonPointerHelpers.get(specs.to, item.after);
          if (typeof rawPathObject !== 'object' || rawPathObject === null)
            continue;
          for (const method of Object.keys(rawPathObject)) {
            if (Object.values(OpenAPIV3.HttpMethods).includes(method as any)) {
              const newDiff: Diff = {
                after: jsonPointerHelpers.append(item.after, method),
                trail: '',
                change: 'added',
              };
              const endpointId = getEndpointId({ path: pathPattern, method });
              const endpoint = grouped.getOrSetEndpoint(endpointId);
              endpoint.diffs.push(newDiff);
            }
          }
        }
      }
    } else if (fact.type === 'operation') {
      const { pathPattern, method } = getLocation(fact);
      const endpointId = getEndpointId({ path: pathPattern, method });
      const endpoint = grouped.getOrSetEndpoint(endpointId);
      type === 'diffs' ? endpoint.diffs.push(item) : endpoint.rules.push(item);
    } else if (
      fact.type === 'request-header' ||
      fact.type === 'request-query' ||
      fact.type === 'request-cookie' ||
      fact.type === 'request-path'
    ) {
      const parameter =
        fact.type === 'request-header'
          ? 'headerParameters'
          : fact.type === 'request-query'
            ? 'queryParameters'
            : fact.type === 'request-cookie'
              ? 'cookieParameters'
              : 'pathParameters';
      const { pathPattern, method } = getLocation(fact);
      const endpointId = getEndpointId({ path: pathPattern, method });
      const endpoint = grouped.getOrSetEndpoint(endpointId);
      const name = getParameterName(specToFetchFrom, fact.location.jsonPath);

      if (endpoint[parameter][name]) {
        type === 'diffs'
          ? endpoint[parameter][name].diffs.push(item)
          : endpoint[parameter][name].rules.push(item);
      } else {
        if (type === 'diffs') {
          endpoint[parameter][name] = { diffs: [item], rules: [] };
        } else {
          endpoint[parameter][name] = { diffs: [], rules: [item] };
        }
      }
    } else if (fact.type === 'requestBody') {
      const { pathPattern, method } = getLocation(fact);
      const endpointId = getEndpointId({ path: pathPattern, method });
      const endpoint = grouped.getOrSetEndpoint(endpointId);
      type === 'diffs'
        ? endpoint.request.diffs.push(item)
        : endpoint.request.rules.push(item);
    } else if (fact.type === 'response') {
      const { pathPattern, method, statusCode } = getLocation(fact);
      const endpointId = getEndpointId({ path: pathPattern, method });
      const response = grouped.getOrSetResponse(endpointId, statusCode);
      type === 'diffs' ? response.diffs.push(item) : response.rules.push(item);
    } else if (fact.type === 'response-header') {
      const { pathPattern, method, statusCode, headerName } = getLocation(fact);
      const endpointId = getEndpointId({ path: pathPattern, method });
      const response = grouped.getOrSetResponse(endpointId, statusCode);
      if (response.headers[headerName]) {
        type === 'diffs'
          ? response.headers[headerName].diffs.push(item)
          : response.headers[headerName].rules.push(item);
      } else {
        if (type === 'diffs') {
          response.headers[headerName] = { diffs: [item], rules: [] };
        } else {
          response.headers[headerName] = { diffs: [], rules: [item] };
        }
      }
    } else if (fact.type === 'body-example' || fact.type === 'body-examples') {
      const location = getLocation(fact);
      if (type === 'diffs') {
        item.trail = jsonPointerHelpers.join(
          jsonPointerHelpers.compile(location.trail),
          item.trail
        );
      }

      const endpointId = getEndpointId({
        path: location.pathPattern,
        method: location.method,
      });
      const body =
        location.location === 'request'
          ? grouped.getOrSetRequestBody(endpointId, location.contentType)
          : grouped.getOrSetResponseBody(
              endpointId,
              location.statusCode,
              location.contentType
            );

      type === 'diffs'
        ? body.examples.diffs.push(item)
        : body.examples.rules.push(item);
    } else if (fact.type === 'body' || fact.type === 'field') {
      const location = getLocation(fact);
      const endpointId = getEndpointId({
        path: location.pathPattern,
        method: location.method,
      });
      const body =
        location.location === 'request'
          ? grouped.getOrSetRequestBody(endpointId, location.contentType)
          : grouped.getOrSetResponseBody(
              endpointId,
              location.statusCode,
              location.contentType
            );
      let fieldKeys: string[];
      if (type === 'diffs') {
        fieldKeys = normalizeRequiredDiff(specToFetchFrom, fact, {
          absolute: item.after ?? item.before,
          trail: item.trail,
        }) ?? [
          'trail' in location ? jsonPointerHelpers.compile(location.trail) : '',
        ];
      } else {
        fieldKeys = normalizeRequiredDiff(specToFetchFrom, fact, {
          absolute: item.location.jsonPath,
          trail: item.trail,
        }) ?? [
          'trail' in location ? jsonPointerHelpers.compile(location.trail) : '',
        ];
      }

      for (const fieldKey of fieldKeys) {
        if (body.fields[fieldKey]) {
          type === 'diffs'
            ? body.fields[fieldKey].diffs.push(item)
            : body.fields[fieldKey].rules.push(item);
        } else {
          if (type === 'diffs') {
            body.fields[fieldKey] = { diffs: [item], rules: [] };
          } else {
            body.fields[fieldKey] = { diffs: [], rules: [item] };
          }
        }
      }
    }
  }

  return grouped;
}
