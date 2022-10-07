import {
  FactVariant,
  IFact,
  OpenApiKind,
  ResultWithSourcemap,
} from '@useoptic/openapi-utilities';
import { EntityBase, RunnerEntityInputs } from '../entity/base';
import JsonPointerHelpers from '@useoptic/json-pointer-helpers/build/json-pointers/json-pointer-helpers';
import { Matcher } from './matcher';
export function runner<OpenAPI, Context>(
  specInputs: RunnerEntityInputs,
  kind: OpenApiKind,
  standard: EntityBase<any, any, any>,
  matcher: Matcher<OpenAPI, Context>
): ResultWithSourcemap[] {
  const before = factsByKind(kind, specInputs.beforeFacts);
  const after = factsByKind(kind, specInputs.afterFacts);

  const lifecycle = groupByLifecycle(before, after);

  const allIdsOfKind = Object.keys(lifecycle);

  allIdsOfKind.filter((i) => {
    matcher();

    return false;
  });

  return [];
}

function factsByKind(kind: OpenApiKind, facts: IFact[]) {
  return facts.filter((i) => i.location.kind === kind);
}

function groupByLifecycle(
  before: FactVariant<any>[],
  after: FactVariant<any>[]
): { [key: string]: 'added' | 'removed' | 'continuous' } {
  const beforeSet = new Set([
    ...before.map((i) => JsonPointerHelpers.compile(i.location.conceptualPath)),
  ]);
  const afterSet = new Set([
    ...after.map((i) => JsonPointerHelpers.compile(i.location.conceptualPath)),
  ]);

  const paths = {};
  new Set([...beforeSet, ...afterSet]).forEach((path) => {
    if (beforeSet.has(path) && afterSet.has(path)) {
      paths[path] = 'continuous';
    }
    if (beforeSet.has(path) && !afterSet.has(path)) {
      paths[path] = 'removed';
    }
    if (!beforeSet.has(path) && afterSet.has(path)) {
      paths[path] = 'added';
    }
  });

  return paths;
}

function getFromSpec<OpenAPIType>(
  fact: FactVariant<any>,
  spec: 'before' | 'after',
  inputs: RunnerEntityInputs
): OpenAPIType {
  const specItem = JsonPointerHelpers.get(
    spec === 'before' ? inputs.beforeSpec : inputs.afterSpec,
    fact.location.jsonPath
  ) as unknown as OpenAPIType;

  return specItem;
}
