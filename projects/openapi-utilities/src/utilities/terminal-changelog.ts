import { OpenAPIV3 } from 'openapi-types';
import { typeofDiff } from '../diff/diff';
import type {
  GroupedDiffs,
  Body,
  Diff,
  Endpoint,
  Response,
} from '../openapi3/group-diff';

import { Instance as Chalk } from 'chalk';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import { getLocation, getRaw } from '../openapi3/traverser';

function getTypeofDiffs(diffs: Diff[]): 'added' | 'changed' | 'removed' | null {
  return diffs.length === 0
    ? null
    : diffs.every((diff) => typeofDiff(diff) === 'added')
    ? 'added'
    : diffs.every((diff) => typeofDiff(diff) === 'removed')
    ? 'removed'
    : 'changed';
}

const chalk = new Chalk();

const added = chalk.green('added');
const removed = chalk.red('removed');
const changed = chalk.yellow('changed');

const INDENTATION = '  ';

const getAddedOrRemovedLabel = (
  change: 'added' | 'changed' | 'removed' | null
) => (change === 'added' ? added : change === 'removed' ? removed : '');

function* getDetailLogs(diffs: Diff[], options: { label?: string } = {}) {
  if (diffs.length === 0) return;
  if (options.label) yield options.label;

  const summarized: {
    added: string[];
    changed: string[];
    removed: string[];
  } = {
    added: [],
    changed: [],
    removed: [],
  };

  for (const diff of diffs) {
    if (diff.trail === '') {
      continue;
    }
    const key = typeofDiff(diff);
    summarized[key].push(diff.trail);
  }

  if (summarized.added.length) {
    const keys = summarized.added.join(', ');
    yield `- ${keys} ${added}`;
  }

  if (summarized.changed.length) {
    const keys = summarized.changed.join(', ');
    yield `- ${keys} ${changed}`;
  }

  if (summarized.removed.length) {
    const keys = summarized.removed.join(', ');
    yield `- ${keys} ${removed}`;
  }

  yield '';
}

function* indent(generator: Generator<string>) {
  for (const y of generator) {
    yield `${INDENTATION}${y}`;
  }
}

export function* terminalChangelog(
  specs: { from: OpenAPIV3.Document; to: OpenAPIV3.Document },
  groupedChanges: GroupedDiffs
): Generator<string> {
  const { paths, specification } = groupedChanges;
  yield* getDetailLogs(specification, {
    label: 'specification details:',
  });

  for (const [path, pathObject] of Object.entries(paths)) {
    const isAdded = pathObject.diffs.some(
      (diff) => typeofDiff(diff) === 'added'
    );
    const isRemoved = pathObject.diffs.some(
      (diff) => typeofDiff(diff) === 'removed'
    );
    if (isAdded || isRemoved) {
      const jsonPath = jsonPointerHelpers.compile(['paths', path]);
      const raw = isAdded
        ? jsonPointerHelpers.get(specs.to, jsonPath)
        : jsonPointerHelpers.get(specs.from, jsonPath);

      for (const method of Object.keys(raw)) {
        yield* getEndpointLogs(method, path, {
          diffs: [
            isAdded
              ? {
                  after: jsonPointerHelpers.compile(['paths', path, method]),
                  trail: '',
                  change: 'added',
                }
              : {
                  before: jsonPointerHelpers.compile(['paths', path, method]),
                  trail: '',
                  change: 'removed',
                },
          ],
          queryParameters: [],
          pathParameters: [],
          cookieParameters: [],
          headerParameters: [],
          request: {
            diffs: [],
            contents: {},
          },
          responses: {},
        });
      }
    }

    for (const [method, endpoint] of Object.entries(pathObject.methods))
      yield* getEndpointLogs(method, path, endpoint);
  }

  function* getEndpointLogs(
    method: string,
    path: string,
    endpointChange: Endpoint
  ): Generator<string> {
    const {
      request,
      responses,
      cookieParameters,
      diffs,
      headerParameters,
      pathParameters,
      queryParameters,
    } = endpointChange;

    const change = getTypeofDiffs(diffs);
    yield `${chalk.bold(method.toUpperCase())} ${path}: ${
      change ? getAddedOrRemovedLabel(change) : ''
    }`;

    yield* indent(getDetailLogs(diffs));

    yield* indent(getParameterLogs('query', queryParameters));

    yield* indent(getParameterLogs('cookie', cookieParameters));

    yield* indent(getParameterLogs('path', pathParameters));

    yield* indent(getParameterLogs('header', headerParameters));

    yield* indent(getRequestChangeLogs(request));

    for (const [statusCode, response] of Object.entries(responses)) {
      yield* indent(getResponseChangeLogs(response, statusCode));
    }

    yield '';
  }

  function* getResponseChangeLogs(response: Response, statusCode: string) {
    const label = `- response ${chalk.bold(statusCode)}:`;
    const change = getTypeofDiffs(response.diffs);

    if (change === 'removed') {
      yield `${label} ${removed}`;
      return;
    }

    if (
      change ||
      response.headers.length ||
      Object.values(response.contents).length
    ) {
      yield `${label} ${change === 'added' ? added : ''}`;
    }

    if (change) {
      yield* indent(getDetailLogs(response.diffs));
    }
    for (const diff of response.headers) {
      yield* indent(getResponseHeaderLogs(diff));
    }

    for (const [key, contentType] of Object.entries(response.contents)) {
      yield* indent(getBodyChangeLogs(contentType, key));
    }
  }

  function* getRequestChangeLogs(request: Endpoint['request']) {
    const change = getTypeofDiffs(request.diffs);
    const label = `- request:`;

    if (change === 'removed') {
      yield `${label} ${removed}`;
      return;
    }

    if (change || Object.values(request.contents).length) {
      yield `${label} ${change === 'added' ? added : ''}`;
    }

    yield* indent(getDetailLogs(request.diffs));

    for (const [key, bodyChange] of Object.entries(request.contents)) {
      yield* indent(getBodyChangeLogs(bodyChange, key));
    }
  }

  function* getBodyChangeLogs(body: Body, key: string) {
    const change = getTypeofDiffs(body.diffs);
    const label = `- body ${chalk.bold(key)}:`;

    if (change === 'removed') {
      yield `${label} ${removed}`;
      return;
    }

    yield `${label} ${change === 'added' ? added : ''}`;

    yield* indent(getDetailLogs(body.diffs));
  }

  function* getResponseHeaderLogs(diff: Diff) {
    const change = typeofDiff(diff);
    const location = getLocation({
      location: { jsonPath: diff.after ?? diff.before },
      type: 'response-header',
    });
    yield `- response header ${chalk.italic(
      location.headerName
    )}: ${getAddedOrRemovedLabel(change)}`;

    if (change !== 'removed') {
      yield* indent(getDetailLogs([diff]));
    }
  }

  function* getParameterLogs(
    parameterType: 'query' | 'cookie' | 'path' | 'header',
    diffs: Diff[]
  ) {
    const diffByName: Record<string, Diff[]> = {};
    for (const diff of diffs) {
      const raw =
        diff.after !== undefined
          ? getRaw(specs.to, {
              location: { jsonPath: diff.after },
              type: `request-${parameterType}`,
            })
          : getRaw(specs.from, {
              location: { jsonPath: diff.before },
              type: `request-${parameterType}`,
            });

      if (diffByName[raw.name]) {
        diffByName[raw.name].push(diff);
      } else {
        diffByName[raw.name] = [diff];
      }
    }

    for (const [name, diffsForName] of Object.entries(diffByName)) {
      const change = getTypeofDiffs(diffsForName);
      yield `- ${parameterType} parameter ${chalk.italic(
        name
      )}: ${getAddedOrRemovedLabel(change)}`;

      if (change !== 'removed') {
        yield* indent(getDetailLogs(diffsForName));
      }
    }
  }
}
