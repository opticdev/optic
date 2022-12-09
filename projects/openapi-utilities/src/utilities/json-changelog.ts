import {
  groupChangesAndRules,
  OpenApiEndpointChange,
  RequestChange,
  ResponseChange,
  BodyChange,
} from './group-changes';
import { ChangeVariant, OpenApiKind, OpenApiFact } from '../openapi3/sdk/types';
import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';

const getChange = (
  change: ChangeVariant<any> | null
): 'added' | 'removed' | 'changed' =>
  change?.added ? 'added' : change?.removed ? 'removed' : 'changed';

const getDiff = (before: object, after: object) => {
  const output = {
    added: <{ key: string; value: any }[]>[],
    changed: <{ key: string; before: any; after: any }[]>[],
    removed: <{ key: string; value: any }[]>[],
  };

  const beforeKeys = new Set(Object.keys(before));
  const afterKeys = new Set(Object.keys(after));

  for (const key of beforeKeys) {
    if (!afterKeys.has(key))
      output.removed.push({ key, value: (before as any)[key] });
    else if (!isEqual((before as any)[key], (after as any)[key]))
      output.changed.push({
        key,
        before: (before as any)[key],
        after: (after as any)[key],
      });
  }

  for (const key of afterKeys) {
    if (!beforeKeys.has(key))
      output.added.push({ key, value: (after as any)[key] });
  }

  return output;
};

const getDetailsDiff = (
  change: ChangeVariant<any>,
  excludedKeys: string[] = []
) => {
  const excludeKeys = (fact: OpenApiFact) => omit(fact, excludedKeys);

  const mergeFlatSchema = (fact: OpenApiFact) => {
    if ('flatSchema' in fact) {
      const { flatSchema, ...factRest } = fact;
      return {
        ...factRest,
        ...flatSchema,
      };
    } else return fact;
  };

  const before = excludeKeys(
    mergeFlatSchema(
      change.added
        ? {}
        : change.removed
        ? change.removed
        : change.changed
        ? change.changed.before
        : {}
    )
  );

  const after = excludeKeys(
    mergeFlatSchema(
      change.added
        ? change.added
        : change.removed
        ? {}
        : change.changed
        ? change.changed.after
        : {}
    )
  );

  return getDiff(before, after);
};

function getDetailLogs(
  change: ChangeVariant<any>,
  options: { label?: string; excludeKeys?: string[] } = {}
): ChangedNode['attributes'] {
  const { label, excludeKeys } = options;
  const diff = getDetailsDiff(change, excludeKeys);

  const diffCount =
    diff.changed.length + diff.removed.length + diff.added.length;

  if (!diffCount) return [];

  const results: ChangedNode['attributes'] = [];

  // don't show children as added
  if (!change.added) {
    diff.added.forEach((added) =>
      results.push({ key: added.key, after: added.value, before: undefined })
    );
  }
  // don't show children as removed
  if (!change.removed) {
    diff.removed.forEach((removed) =>
      results.push({
        key: removed.key,
        before: removed.value,
        after: undefined,
      })
    );
  }
  diff.changed.forEach((changed) =>
    results.push({
      key: changed.key,
      before: changed.before,
      after: changed.after,
    })
  );

  return results;
}

type ChangedNode = {
  name: string;
  change: 'added' | 'removed' | 'changed';
  attributes: { key: string; before: any; after: any }[];
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
  groupedChanges: ReturnType<typeof groupChangesAndRules>
): JsonChangelog {
  const results: JsonChangelog = { operations: [] };

  const { changesByEndpoint, specification } = groupedChanges;
  for (const [_, endpointChange] of changesByEndpoint) {
    results.operations.push(getEndpointLogs(endpointChange));
  }

  return results;
}

function getEndpointLogs(
  endpointChange: OpenApiEndpointChange
): OperationChangelog {
  const {
    method,
    path,
    request,
    responses,
    cookieParameters,
    change,
    headers,
    pathParameters,
    queryParameters,
  } = endpointChange;

  const parameterChanges = [];
  for (const [name, parameterChange] of queryParameters.changes) {
    parameterChanges.push(getParameterLogs('query', name, parameterChange));
  }

  for (const [name, parameterChange] of cookieParameters.changes) {
    parameterChanges.push(getParameterLogs('cookie', name, parameterChange));
  }

  for (const [name, parameterChange] of pathParameters.changes) {
    parameterChanges.push(getParameterLogs('path', name, parameterChange));
  }

  for (const [name, parameterChange] of headers.changes) {
    parameterChanges.push(getParameterLogs('header', name, parameterChange));
  }

  const responseChanges: ChangedNode[] = [];
  for (const [key, response] of responses) {
    responseChanges.push(getResponseChangeLogs(response, key));
  }

  const requestChangelogs = getRequestChangeLogs(request);
  return {
    name: `${method} ${path}`,
    change: getChange(change),
    attributes: change
      ? getDetailLogs(change, {
          excludeKeys: ['pathPattern', 'method'],
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
  { change, headers, contentTypes }: ResponseChange,
  key: string
): ChangedNode & {
  contentTypes: (ChangedNode & { schemaChanges: ChangedNode[] })[];
} {
  const contentTypeChanges: (ChangedNode & { schemaChanges: ChangedNode[] })[] =
    [];

  for (const [key, contentType] of contentTypes) {
    contentTypeChanges.push(getBodyChangeLogs(contentType, key));
  }

  return {
    name: `${key} response`,
    change: getChange(change),
    attributes: change
      ? getDetailLogs(change, { excludeKeys: ['statusCode'] })
      : [],
    contentTypes: contentTypeChanges,
  };
}

function getRequestChangeLogs({
  change,
  bodyChanges,
}: RequestChange): ChangedNode & {
  contentTypes: (ChangedNode & { schemaChanges: ChangedNode[] })[];
} {
  const contentTypes: (ChangedNode & { schemaChanges: ChangedNode[] })[] = [];
  for (const [key, bodyChange] of bodyChanges) {
    contentTypes.push(getBodyChangeLogs(bodyChange, key));
  }

  return {
    name: `Request Body`,
    change: getChange(change),
    attributes: change
      ? getDetailLogs(change, { excludeKeys: ['content'] })
      : [],
    contentTypes: contentTypes,
  };
}

function getBodyChangeLogs(
  { bodyChange, fieldChanges, exampleChanges }: BodyChange,
  key: string
): ChangedNode & { schemaChanges: ChangedNode[] } {
  return {
    name: `${key}`,
    change: getChange(bodyChange),
    attributes: bodyChange
      ? getDetailLogs(bodyChange, { excludeKeys: ['contentType'] })
      : [],
    schemaChanges: fieldChanges.map((fieldChange) => getFieldLogs(fieldChange)),
  };
}

function getFieldLogs(change: ChangeVariant<OpenApiKind.Field>): ChangedNode {
  const path = change.location.conceptualLocation.jsonSchemaTrail
    .filter((i) => i !== 'properties')
    .join('.');

  return {
    name: path,
    change: getChange(change),
    attributes: change ? getDetailLogs(change, { excludeKeys: ['key'] }) : [],
  };
}

function getParameterLogs(
  parameterType: string,
  parameterName: string,
  change: ChangeVariant<
    | OpenApiKind.QueryParameter
    | OpenApiKind.CookieParameter
    | OpenApiKind.PathParameter
    | OpenApiKind.HeaderParameter
  >
): ChangedNode {
  return {
    name: `${parameterType} parameter '${parameterName}'`,
    change: getChange(change),
    attributes: getDetailLogs(change, { excludeKeys: ['name', 'in'] }),
  };
}
