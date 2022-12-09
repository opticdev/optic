import {
  groupChangesAndRules,
  OpenApiEndpointChange,
  RequestChange,
  ResponseChange,
  BodyChange,
} from './group-changes';
import { ChangeVariant, OpenApiKind, OpenApiFact } from '../openapi3/sdk/types';
import { Instance as Chalk } from 'chalk';
import isEqual from 'lodash.isequal';
import omit from 'lodash.omit';

const chalk = new Chalk();

const added = chalk.green('added');
const removed = chalk.red('removed');
const changed = chalk.yellow('changed');

const INDENTATION = '  ';

const getAddedOrRemovedLabel = (change: ChangeVariant<any>) =>
  change.added ? added : change.removed ? removed : '';

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

function* getDetailLogs(
  change: ChangeVariant<any>,
  options: { label?: string; excludeKeys?: string[] } = {}
) {
  const { label, excludeKeys } = options;
  const diff = getDetailsDiff(change, excludeKeys);

  const diffCount =
    diff.changed.length + diff.removed.length + diff.added.length;

  if (!diffCount) return;

  if (label) yield label;

  if (diff.added.length) {
    const keys = diff.added.join(', ');
    yield `- ${keys} ${added}`;
  }

  if (diff.changed.length) {
    const keys = diff.changed.join(', ');
    yield `- ${keys} ${changed}`;
  }

  if (diff.removed.length) {
    const keys = diff.removed.join(', ');
    yield `- ${keys} ${removed}`;
  }
}

function* indent(generator: Generator<string>) {
  for (const y of generator) {
    yield `${INDENTATION}${y}`;
  }
}

export function* terminalChangelog(
  groupedChanges: ReturnType<typeof groupChangesAndRules>
): Generator<string> {
  const { changesByEndpoint, specification } = groupedChanges;
  for (const specificationChange of specification.changes) {
    yield* getDetailLogs(specificationChange, {
      label: 'specification details:',
    });
    yield '';
  }
  for (const [_, endpointChange] of changesByEndpoint) {
    yield* getEndpointLogs(endpointChange);
  }
}

function* getEndpointLogs(
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

  yield `${chalk.bold(method.toUpperCase())} ${path}: ${
    change ? getAddedOrRemovedLabel(change) : ''
  }`;

  if (change?.removed) {
    return;
  }

  if (change) {
    yield* indent(
      getDetailLogs(change, { excludeKeys: ['pathPattern', 'method'] })
    );
  }

  for (const [name, parameterChange] of queryParameters.changes) {
    yield* indent(getParameterLogs('query', name, parameterChange));
  }

  for (const [name, parameterChange] of cookieParameters.changes) {
    yield* indent(getParameterLogs('cookie', name, parameterChange));
  }

  for (const [name, parameterChange] of pathParameters.changes) {
    yield* indent(getParameterLogs('path', name, parameterChange));
  }

  for (const [name, parameterChange] of headers.changes) {
    yield* indent(getParameterLogs('header', name, parameterChange));
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
  const label = `- response ${chalk.bold(key)}:`;

  if (change?.removed) {
    yield `${label} ${removed}`;
    return;
  }

  if (change || headers.changes.size || contentTypes.size) {
    yield `${label} ${change?.added ? added : ''}`;
  }

  if (change) {
    yield* indent(getDetailLogs(change, { excludeKeys: ['statusCode'] }));
  }
  for (const [key, responseHeader] of headers.changes) {
    yield* indent(getResponseHeaderLogs(responseHeader, key));
  }

  for (const [key, contentType] of contentTypes) {
    yield* indent(getBodyChangeLogs(contentType, key));
  }
}

function* getRequestChangeLogs({ change, bodyChanges }: RequestChange) {
  const label = `- request:`;

  if (change?.removed) {
    yield `${label} ${removed}`;
    return;
  }

  if (change || bodyChanges.size) {
    yield `${label} ${change?.added ? added : ''}`;
  }

  if (change) {
    yield* indent(getDetailLogs(change));
  }

  for (const [key, bodyChange] of bodyChanges) {
    yield* indent(getBodyChangeLogs(bodyChange, key));
  }
}

function* getBodyChangeLogs(
  { bodyChange, fieldChanges, exampleChanges }: BodyChange,
  key: string
) {
  const label = `- body ${chalk.bold(key)}:`;

  if (bodyChange?.removed) {
    yield `${label} ${removed}`;
    return;
  }

  if (bodyChange || fieldChanges.length || exampleChanges.length) {
    yield `${label} ${bodyChange?.added ? added : ''}`;
  }

  if (bodyChange) {
    yield* indent(getDetailLogs(bodyChange, { excludeKeys: ['contentType'] }));
  }

  for (const fieldChange of fieldChanges) {
    yield* indent(getFieldLogs(fieldChange));
  }

  for (const exampleChange of exampleChanges) {
    yield* indent(getExampleLogs(exampleChange));
  }
}

function* getResponseHeaderLogs(
  change: ChangeVariant<OpenApiKind.ResponseHeader>,
  key: string
) {
  yield `- response header ${chalk.italic(key)}: ${getAddedOrRemovedLabel(
    change
  )}`;

  if (!change.removed) {
    yield* indent(getDetailLogs(change, { excludeKeys: ['name'] }));
  }
}
function* getFieldLogs(change: ChangeVariant<OpenApiKind.Field>) {
  const path = change.location.conceptualPath;
  const key = path[path.length - 1];
  yield `- field ${chalk.italic(key)} ${getAddedOrRemovedLabel(change)}`;

  if (!change.removed) {
    yield* indent(getDetailLogs(change, { excludeKeys: ['key'] }));
  }
}

function* getExampleLogs(change: ChangeVariant<OpenApiKind.BodyExample>) {
  yield `- example ${getAddedOrRemovedLabel(change)}`;
  if (!change.removed) {
    yield* indent(
      getDetailLogs(change, { excludeKeys: ['name', 'contentType'] })
    );
  }
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
  )}: ${getAddedOrRemovedLabel(change)}`;

  if (!change.removed) {
    yield* indent(getDetailLogs(change));
  }
}
