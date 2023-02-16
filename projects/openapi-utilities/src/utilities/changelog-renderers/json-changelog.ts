import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

import { typeofV3Diffs } from '../../openapi3/group-diff';
import type {
  GroupedDiffs,
  Body,
  Diff,
  Endpoint,
  Response,
} from '../../openapi3/group-diff';
import { interpretFieldLevelDiffs } from './common';
import isEqual from 'lodash.isequal';

type RawChange<T> = { key: string } & (
  | {
      added: T;
      changed?: undefined;
      removed?: undefined;
    }
  | {
      added?: undefined;
      removed?: undefined;
      changed: {
        before: T;
        after: T;
      };
    }
  | {
      added?: undefined;
      changed?: undefined;
      removed: T;
    }
);

function isObject(a: any) {
  return typeof a === 'object' && a !== null && !Array.isArray(a);
}

// This function mutates and removes keys
function omitSameValueKeys(a: any, b: any): [any, any] {
  const keysToOmit: Set<string> = new Set();
  const keysToContinue: Set<string> = new Set();
  if (isObject(a) && isObject(b)) {
    const clonedA = { ...a };
    const clonedB = { ...b };
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (isEqual(a[key], b[key])) {
        keysToOmit.add(key);
      } else if (isObject(a[key]) && isObject(b[key])) {
        keysToContinue.add(key);
      }
    }

    for (const key of keysToOmit) {
      delete clonedA[key];
      delete clonedB[key];
    }
    for (const key of keysToContinue) {
      const [aValue, bValue] = omitSameValueKeys(a[key], b[key]);
      clonedA[key] = aValue;
      clonedB[key] = bValue;
    }
    return [clonedA, clonedB];
  }
  return [a, b];
}

const getDetailsDiff = (change: RawChange<any>): ChangedNode['attributes'] => {
  if (change.changed) {
    const [before, after] = omitSameValueKeys(
      change.changed.before,
      change.changed.after
    );
    return [
      {
        key: change.key,
        change: 'changed',
        before,
        after,
      },
    ];
  }
  return [
    {
      key: change.key,
      ...(change.added
        ? {
            before: undefined,
            after: change.added,
            change: 'added',
          }
        : {
            before: change.removed,
            after: undefined,
            change: 'removed',
          }),
    },
  ];
};

type ChangedNode = {
  name: string;
  change: 'added' | 'removed' | 'changed' | null;
  attributes: {
    key: string;
    before: any;
    after: any;
    change: 'added' | 'changed' | 'removed';
  }[];
};

type OperationChangelog = ChangedNode & {
  parameters: ChangedNode[];
  requestBody?: ChangedNode;
  responses: ChangedNode[];
};

type JsonChangelog = {
  operations: OperationChangelog[];
};

function attachRequiredToField(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  diff: Diff,
  rawChange: RawChange<any>
) {
  let beforeRequired = false;
  let afterRequired = false;
  if (diff.after) {
    const parts = jsonPointerHelpers.decode(diff.after);
    const pointer = parts.slice(0, -2);
    const key = parts[parts.length - 1];
    const raw = jsonPointerHelpers.tryGet(
      specs.to,
      jsonPointerHelpers.compile([...pointer, 'required'])
    );
    if (raw.match && Array.isArray(raw.value) && raw.value.includes(key)) {
      afterRequired = true;
    }
  }

  if (diff.before) {
    const parts = jsonPointerHelpers.decode(diff.before);
    const pointer = parts.slice(0, -2);
    const key = parts[parts.length - 1];
    const raw = jsonPointerHelpers.tryGet(
      specs.from,
      jsonPointerHelpers.compile([...pointer, 'required'])
    );
    if (raw.match && Array.isArray(raw.value) && raw.value.includes(key)) {
      beforeRequired = true;
    }
  }

  if (rawChange.added) {
    rawChange.added = {
      ...rawChange.added,
      required: afterRequired,
    };
  } else if (rawChange.changed) {
    rawChange.changed = {
      before: {
        ...rawChange.changed.before,
        required: beforeRequired,
      },
      after: {
        ...rawChange.changed.after,
        required: afterRequired,
      },
    };
  } else if (rawChange.removed) {
    rawChange.removed = {
      ...rawChange.removed,
      required: beforeRequired,
    };
  }
}

export function jsonChangelog(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  groupedChanges: GroupedDiffs
): JsonChangelog {
  const results: JsonChangelog = { operations: [] };

  for (const endpoint of Object.values(groupedChanges.endpoints))
    results.operations.push(getEndpointLogs(specs, endpoint));

  return results;
}

function getEndpointLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  endpointChange: Endpoint
): OperationChangelog {
  const {
    method,
    path,
    request,
    responses,
    cookieParameters,
    diffs,
    headerParameters,
    pathParameters,
    queryParameters,
  } = endpointChange;

  const operationChange = typeofV3Diffs(diffs);

  const parameterChanges = [];
  for (const [name, diffs] of Object.entries(queryParameters)) {
    parameterChanges.push(
      getParameterLogs(
        specs,
        {
          type: 'query',
          name,
          method,
          path,
        },
        diffs
      )
    );
  }

  for (const [name, diffs] of Object.entries(cookieParameters)) {
    parameterChanges.push(
      getParameterLogs(
        specs,
        {
          type: 'cookie',
          name,
          method,
          path,
        },
        diffs
      )
    );
  }

  for (const [name, diffs] of Object.entries(pathParameters)) {
    parameterChanges.push(
      getParameterLogs(
        specs,
        {
          type: 'path',
          name,
          method,
          path,
        },
        diffs
      )
    );
  }

  for (const [name, diffs] of Object.entries(headerParameters)) {
    parameterChanges.push(
      getParameterLogs(
        specs,
        {
          type: 'header',
          name,
          method,
          path,
        },
        diffs
      )
    );
  }

  const responseChanges: ChangedNode[] = [];
  for (const [statusCode, response] of Object.entries(responses)) {
    responseChanges.push(getResponseChangeLogs(specs, response, statusCode));
  }
  const requestChangelogs = getRequestChangeLogs(specs, request);

  return {
    name: `${method} ${path}`,
    change: operationChange ?? 'changed',
    attributes: operationChange
      ? diffs.flatMap((diff) => {
          const rawChange = getRawChange(diff, specs);
          return getDetailsDiff(rawChange);
        })
      : [],
    parameters: parameterChanges,
    requestBody:
      requestChangelogs.attributes.length ||
      requestChangelogs.contentTypes.length
        ? requestChangelogs
        : undefined,
    responses: responseChanges,
  };
}

function getResponseChangeLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  response: Response,
  statusCode: string
): ChangedNode & {
  contentTypes: ChangedNode[];
} {
  const contentTypeChanges: ChangedNode[] = [];
  const responseChange = typeofV3Diffs(response.diffs);

  for (const [contentType, body] of Object.entries(response.contents)) {
    contentTypeChanges.push(getBodyChangeLogs(specs, body, contentType));
  }

  // TODO this is missing response-headers
  return {
    name: `${statusCode} response`,
    change: responseChange ?? 'changed',
    attributes: responseChange
      ? response.diffs.flatMap((diff) => {
          const rawChange = getRawChange(diff, specs);
          return getDetailsDiff(rawChange);
        })
      : [],
    contentTypes: contentTypeChanges,
  };
}

function getRequestChangeLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  request: Endpoint['request']
): ChangedNode & {
  contentTypes: ChangedNode[];
} {
  const contentTypes: ChangedNode[] = [];
  const requestChange = typeofV3Diffs(request.diffs);

  for (const [contentType, body] of Object.entries(request.contents)) {
    contentTypes.push(getBodyChangeLogs(specs, body, contentType));
  }

  return {
    name: `Request Body`,
    change: requestChange ?? 'changed',
    attributes: requestChange
      ? request.diffs.flatMap((diff) => {
          const rawChange = getRawChange(diff, specs);
          return getDetailsDiff(rawChange);
        })
      : [],
    contentTypes: contentTypes,
  };
}

function getBodyChangeLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  body: Body,
  contentType: string
): ChangedNode {
  const fieldDiffs = interpretFieldLevelDiffs(specs, body.fields);
  const exampleDiffs = body.examples;

  // Group body diffs by trail and then log based on that

  const bodyChange = typeofV3Diffs([...fieldDiffs, ...exampleDiffs]);

  return {
    name: `${contentType}`,
    change: bodyChange,
    attributes: bodyChange
      ? fieldDiffs
          .flatMap((diff) => {
            const rawChange = getRawChange(diff, specs);
            if (diff.trail !== '') {
              attachRequiredToField(specs, diff, rawChange);
            }
            return getDetailsDiff(rawChange);
          })
          .concat(
            exampleDiffs.flatMap((diff) => {
              const rawChange = getRawChange(diff, specs);
              return getDetailsDiff(rawChange);
            })
          )
      : [],
  };
}

function getParameterIndices(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  location: { operation: string; name: string; type: string }
) {
  const beforeParameters = jsonPointerHelpers.tryGet(
    specs.from,
    location.operation
  );
  const afterParameters = jsonPointerHelpers.tryGet(
    specs.to,
    location.operation
  );
  const before: number = beforeParameters.match
    ? beforeParameters.value.findIndex(
        (p: any) => p.name === location.name && p.in === location.type
      )
    : -1;
  const after: number = afterParameters.match
    ? afterParameters.value.findIndex(
        (p: any) => p.name === location.name && p.in === location.type
      )
    : -1;

  return {
    before,
    after,
  };
}

function getParameterLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  {
    type,
    name,
    path,
    method,
  }: {
    type: string;
    name: string;
    path: string;
    method: string;
  },
  diffs: Diff[]
): ChangedNode {
  const operationTrail = jsonPointerHelpers.compile([
    'paths',
    path,
    method,
    'parameters',
  ]);
  const attributeDiffs: Diff[] = [];
  const enumPaths = new Set<string>();
  for (const diff of diffs) {
    const trail = diff.after ?? diff.before;
    const parts = jsonPointerHelpers.decode(trail);
    const enumIndex = parts.findIndex((p) => p === 'enum');
    if (enumIndex !== -1) {
      // /paths/:path/:method/parameters/:index
      const key = jsonPointerHelpers.compile(parts.slice(5, enumIndex + 1));
      enumPaths.add(key);
    } else {
      attributeDiffs.push(diff);
    }
  }

  for (const enumPath of enumPaths) {
    // find the enum in both before and after
    const indices = getParameterIndices(specs, {
      operation: operationTrail,
      name,
      type,
    });

    const before = jsonPointerHelpers.append(
      operationTrail,
      String(indices.before),
      ...jsonPointerHelpers.decode(enumPath)
    );
    const after = jsonPointerHelpers.append(
      operationTrail,
      String(indices.after),
      ...jsonPointerHelpers.decode(enumPath)
    );
    const beforeEnum = jsonPointerHelpers.tryGet(specs.from, before);
    const afterEnum = jsonPointerHelpers.tryGet(specs.to, after);

    attributeDiffs.push({
      trail: enumPath,
      change:
        beforeEnum.match && afterEnum.match
          ? 'changed'
          : beforeEnum.match
          ? 'removed'
          : 'added',
      before: beforeEnum.match ? before : undefined,
      after: afterEnum.match ? after : undefined,
    } as any);
  }

  return {
    name: `${type} parameter '${name}'`,
    change: typeofV3Diffs(diffs),
    attributes: attributeDiffs.flatMap((diff) => {
      const rawChange = getRawChange(diff, specs);
      return getDetailsDiff(rawChange);
    }),
  };
}

function getRawChange(
  diff: Diff,
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document }
): RawChange<any> {
  if (diff.before !== undefined && diff.after !== undefined) {
    return {
      key: diff.trail,
      changed: {
        before: jsonPointerHelpers.get(specs.from, diff.before),
        after: jsonPointerHelpers.get(specs.to, diff.after),
      },
    };
  } else if (diff.before !== undefined) {
    return {
      key: diff.trail,
      removed: jsonPointerHelpers.get(specs.from, diff.before),
    };
  } else {
    return {
      key: diff.trail,
      added: jsonPointerHelpers.get(specs.to, diff.after),
    };
  }
}
