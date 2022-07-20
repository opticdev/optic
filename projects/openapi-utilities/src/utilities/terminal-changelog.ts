import {
  groupChanges,
  OpenApiEndpointChange,
  RequestChange,
  ResponseChange,
  BodyChange,
} from './group-changes';
import { ChangeVariant, OpenApiKind } from '../openapi3/sdk/types';
import { Instance as Chalk } from 'chalk';
import isEqual from 'lodash.isequal';

const chalk = new Chalk();

const added = chalk.green('added');
const removed = chalk.red('removed');
const changed = chalk.yellow('changed');

const INDENTATION = '  ';

const getModificationLabel = (change: ChangeVariant<any>) =>
  change.added ? added : change.removed ? removed : changed;

const getDiff = (before: object, after: object) => {
  const output = {
    added: <string[]>[],
    changed: <string[]>[],
    removed: <string[]>[],
  };

  const beforeKeys = new Set(Object.keys(before));
  const afterKeys = new Set(Object.keys(after));

  for (const key of beforeKeys) {
    if (!afterKeys.has(key)) output.removed.push(key);
    else if (!isEqual((before as any)[key], (after as any)[key]))
      output.changed.push(key);
  }

  for (const key of afterKeys) {
    if (!beforeKeys.has(key)) output.added.push(key);
  }

  return output;
};

function* indent(generator: Generator<string>) {
  for (const y of generator) {
    yield `${INDENTATION}${y}`;
  }
}

export function* terminalChangelog(
  groupedChanges: ReturnType<typeof groupChanges>
): Generator<string> {
  const { changesByEndpoint, specificationChanges } = groupedChanges;
  for (const specificationChange of specificationChanges) {
    yield* getSpecificationLogs(specificationChange);
  }
  if (specificationChanges.length) {
    yield '';
  }
  for (const [_, openApiChange] of changesByEndpoint) {
    yield* getOpenApiChangeLogs(openApiChange);
  }
}

function* getOpenApiChangeLogs(
  endpointChange: OpenApiEndpointChange
): Generator<string> {
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

  yield `${chalk.bold(method.toUpperCase())} ${path}:`;

  if (change) {
    yield* indent(getOperationLogs(change));
  }

  for (const [label, parameter] of queryParameters) {
    yield* indent(getParameterLogs('query', label, parameter));
  }

  for (const [label, parameter] of cookieParameters) {
    yield* indent(getParameterLogs('cookie', label, parameter));
  }

  for (const [label, parameter] of pathParameters) {
    yield* indent(getParameterLogs('path', label, parameter));
  }

  for (const [label, parameter] of headers) {
    yield* indent(getParameterLogs('header', label, parameter));
  }

  yield* indent(getRequestChangeLogs(request));

  for (const [key, response] of responses) {
    yield* indent(getResponseChangeLogs(response, key));
  }

  yield '';
}

function* getResponseChangeLogs(
  { change, headers, contentTypes }: ResponseChange,
  key: string
) {
  if (change || headers.size || contentTypes.size) {
    yield `- response ${chalk.bold(key)}:`;
  }

  if (change) {
    yield* indent(getResponseLogs(change));
  }
  for (const [key, responseHeader] of headers) {
    yield* indent(getResponseHeaderLogs(responseHeader, key));
  }

  for (const [key, contentType] of contentTypes) {
    yield* indent(getBodyChangeLogs(contentType, key));
  }
}

function* getRequestChangeLogs({ change, bodyChanges }: RequestChange) {
  if (change || bodyChanges.size) {
    yield `- request:`;
  }

  if (change) {
    yield* indent(getRequestLogs(change));
  }

  for (const [key, bodyChange] of bodyChanges) {
    yield* indent(getBodyChangeLogs(bodyChange, key));
  }
}

function* getBodyChangeLogs(
  { bodyChange, fieldChanges, exampleChanges }: BodyChange,
  key: string
) {
  if (bodyChange || fieldChanges.length || exampleChanges.length) {
    yield `- body ${chalk.bold(key)}:`;
  }

  if (bodyChange) {
    yield* indent(getBodyLogs(bodyChange));
  }

  for (const fieldChange of fieldChanges) {
    yield* indent(getFieldLogs(fieldChange));
  }

  for (const exampleChange of exampleChanges) {
    yield* indent(getExampleLogs(exampleChange));
  }
}

const getDetailsDiff = (change: ChangeVariant<any>) => {
  const before = change.added
    ? {}
    : change.removed
    ? change.removed
    : change.changed
    ? change.changed.before
    : {};

  const after = change.added
    ? change.added
    : change.removed
    ? {}
    : change.changed
    ? change.changed.after
    : {};

  return getDiff(before, after);
};

function* getDetailLogs(change: ChangeVariant<any>, label: string) {
  const diff = getDetailsDiff(change);

  const diffCount =
    diff.changed.length + diff.removed.length + diff.added.length;

  if (!diffCount) return;

  yield `${label}:`;

  if (diff.added.length) {
    const keys = diff.added.join(', ');
    yield `${INDENTATION}- ${keys} ${added}`;
  }

  if (diff.changed.length) {
    const keys = diff.changed.join(', ');
    yield `${INDENTATION}- ${keys} ${changed}`;
  }

  if (diff.removed.length) {
    const keys = diff.removed.join(', ');
    yield `${INDENTATION}- ${keys} ${removed}`;
  }
}

function getSpecificationLogs(
  change: ChangeVariant<OpenApiKind.Specification>
) {
  return getDetailLogs(change, 'specification details');
}

function* getResponseHeaderLogs(
  change: ChangeVariant<OpenApiKind.ResponseHeader>,
  key: string
) {
  yield `- response header ${chalk.italic(key)} ${getModificationLabel(
    change
  )}`;
}

function getResponseLogs(change: ChangeVariant<OpenApiKind.Response>) {
  return getDetailLogs(change, '- response details');
}

function getRequestLogs(change: ChangeVariant<OpenApiKind.Request>) {
  return getDetailLogs(change, '- request details');
}

function getBodyLogs(change: ChangeVariant<OpenApiKind.Body>) {
  return getDetailLogs(change, '- body details');
}

function* getFieldLogs(change: ChangeVariant<OpenApiKind.Field>) {
  const key = change.location.conceptualPath.at(-1);
  yield `- field ${chalk.italic(key)} ${getModificationLabel(change)}`;
}

function* getExampleLogs(change: ChangeVariant<OpenApiKind.BodyExample>) {
  yield `- example ${getModificationLabel(change)}`;
}

function getOperationLogs(change: ChangeVariant<OpenApiKind.Operation>) {
  return getDetailLogs(change, '- operation details');
}

function* getParameterLogs(
  parameterType: string,
  parameterName: string,
  change: ChangeVariant<
    | OpenApiKind.QueryParameter
    | OpenApiKind.CookieParameter
    | OpenApiKind.PathParameter
    | OpenApiKind.HeaderParameter
  >
) {
  yield `- ${parameterType} parameter ${chalk.italic(
    parameterName
  )} ${getModificationLabel(change)}`;
}
