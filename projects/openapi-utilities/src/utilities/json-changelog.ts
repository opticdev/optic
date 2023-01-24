import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

import { typeofDiff, getTypeofDiffs } from '../diff/diff';
import type {
  GroupedDiffs,
  Body,
  Diff,
  Endpoint,
  Response,
} from '../openapi3/group-diff';
import { getRaw } from '../openapi3/traverser';

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

  const operationChange = getTypeofDiffs(diffs);

  const parameterChanges = [];
  for (const diff of queryParameters) {
    parameterChanges.push(getParameterLogs(specs, 'request-query', diff));
  }

  for (const diff of cookieParameters) {
    parameterChanges.push(getParameterLogs(specs, 'request-cookie', diff));
  }

  for (const diff of pathParameters) {
    parameterChanges.push(getParameterLogs(specs, 'request-path', diff));
  }

  for (const diff of headerParameters) {
    parameterChanges.push(getParameterLogs(specs, 'request-header', diff));
  }

  const responseChanges: ChangedNode[] = [];
  for (const [statusCode, response] of Object.entries(responses)) {
    responseChanges.push(getResponseChangeLogs(specs, response, statusCode));
  }
  const requestChangelogs = getRequestChangeLogs(specs, request);

  return {
    name: `${method} ${path}`,
    change: operationChange,
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
  const responseChange = getTypeofDiffs(response.diffs);

  for (const [contentType, body] of Object.entries(response.contents)) {
    contentTypeChanges.push(getBodyChangeLogs(specs, body, contentType));
  }

  // TODO this is missing response-headers
  return {
    name: `${statusCode} response`,
    change: responseChange,
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
  const requestChange = getTypeofDiffs(request.diffs);

  for (const [contentType, body] of Object.entries(request.contents)) {
    contentTypes.push(getBodyChangeLogs(specs, body, contentType));
  }

  return {
    name: `Request Body`,
    change: requestChange,
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
  const bodyChange = getTypeofDiffs(body.diffs);

  return {
    name: `${contentType}`,
    change: bodyChange,
    attributes: bodyChange
      ? body.diffs.flatMap((diff) => {
          const rawChange = getRawChange(diff, specs);
          return getDetailsDiff(rawChange);
        })
      : [],
  };
}

function getParameterLogs(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  parameterType:
    | 'request-header'
    | 'request-query'
    | 'request-cookie'
    | 'request-path',
  diff: Diff
): ChangedNode {
  const raw =
    diff.after !== undefined
      ? getRaw(specs.to, {
          location: { jsonPath: diff.after },
          type: parameterType,
        })
      : getRaw(specs.from, {
          location: { jsonPath: diff.before },
          type: parameterType,
        });

  const rawChange = getRawChange(diff, specs);
  return {
    name: `${parameterType} parameter '${raw.name}'`,
    change: typeofDiff(diff),
    attributes: getDetailsDiff(rawChange),
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
