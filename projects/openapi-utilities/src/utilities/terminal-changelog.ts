import {
  groupChanges,
  OpenApiEndpointChange,
  RequestChange,
  ResponseChange,
  BodyChange,
} from './group-changes';
import { ChangeVariant, OpenApiKind } from '../openapi3/sdk/types';
import { Instance as Chalk } from 'chalk';

const chalk = new Chalk();

const getModificationLabel = (change: ChangeVariant<any>) =>
  change.added
    ? chalk.green('added')
    : change.removed
    ? chalk.red('removed')
    : chalk.yellow('changed');

function* indent(generator: Generator<string>) {
  for (const y of generator) {
    yield `  ${y}`;
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

function* getSpecificationLogs(
  change: ChangeVariant<OpenApiKind.Specification>
) {
  yield `Specification details ${getModificationLabel(change)}`;
}

function* getResponseHeaderLogs(
  change: ChangeVariant<OpenApiKind.ResponseHeader>,
  key: string
) {
  yield `- response header ${chalk.italic(key)} ${getModificationLabel(
    change
  )}`;
}

function* getResponseLogs(change: ChangeVariant<OpenApiKind.Response>) {
  yield `- response details ${getModificationLabel(change)}`;
}

function* getRequestLogs(change: ChangeVariant<OpenApiKind.Request>) {
  yield `- request details ${getModificationLabel(change)}`;
}

function* getBodyLogs(change: ChangeVariant<OpenApiKind.Body>) {
  yield `- body details ${getModificationLabel(change)}`;
}

function* getFieldLogs(change: ChangeVariant<OpenApiKind.Field>) {
  const key = change.location.conceptualPath.at(-1);
  yield `- field ${chalk.italic(key)} ${getModificationLabel(change)}`;
}

function* getExampleLogs(change: ChangeVariant<OpenApiKind.BodyExample>) {
  yield `- example ${getModificationLabel(change)}`;
}

function* getOperationLogs(change: ChangeVariant<OpenApiKind.Operation>) {
  yield `- operation details ${getModificationLabel(change)}`;
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
