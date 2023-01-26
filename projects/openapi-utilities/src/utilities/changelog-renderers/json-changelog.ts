import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

import { typeofDiff } from '../../diff/diff';
import { typeofV3Diffs } from '../../openapi3/group-diff';
import type {
  GroupedDiffs,
  Body,
  Diff,
  Endpoint,
  Response,
} from '../../openapi3/group-diff';
import { getRaw } from '../../openapi3/traverser';
import { interpretFieldLevelDiffs } from './common';

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

const getDetailsDiff = (change: RawChange<any>): ChangedNode['attributes'] => {
  return [
    {
      key: change.key,
      ...(change.added
        ? {
            before: undefined,
            after: change.added,
            change: 'added',
          }
        : change.changed
        ? { ...change.changed, change: 'changed' }
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
    parameterChanges.push(getParameterLogs(specs, 'query', name, diffs));
  }

  for (const [name, diffs] of Object.entries(cookieParameters)) {
    parameterChanges.push(getParameterLogs(specs, 'cookie', name, diffs));
  }

  for (const [name, diffs] of Object.entries(pathParameters)) {
    parameterChanges.push(getParameterLogs(specs, 'path', name, diffs));
  }

  for (const [name, diffs] of Object.entries(headerParameters)) {
    parameterChanges.push(getParameterLogs(specs, 'header', name, diffs));
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
              if (
                raw.match &&
                Array.isArray(raw.value) &&
                raw.value.includes(key)
              ) {
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
              if (
                raw.match &&
                Array.isArray(raw.value) &&
                raw.value.includes(key)
              ) {
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

function getParameterLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  type: string,
  name: string,
  diffs: Diff[]
): ChangedNode {
  return {
    name: `${type} parameter '${name}'`,
    change: typeofV3Diffs(diffs),
    attributes: diffs.flatMap((diff) => {
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
