import {
  ChangeVariant,
  FactVariant,
  IChange,
  IFact,
  OpenApiKind,
  OpenApiOperationFact,
  OpenAPIV3,
} from '@useoptic/openapi-utilities';
import { ApiStandards } from '../standard';
import {
  applyOperationStandard,
  OperationToTest,
  qualifyOperation,
} from './operation-standard';
import { OperationStandard } from '../open-api-standard';

export function applyStandards(
  apiStandards: ApiStandards,
  currentFacts: IFact[],
  nextFacts: IFact[],
  changelog: IChange[]
  // nextJsonLike: OpenAPIV3.Document,
  // currentJsonLike: OpenAPIV3.Document
) {
  const operations = collectOperations(currentFacts, nextFacts, changelog);

  const qualifiedAdded = (apiStandards.styleGuides?.onAdded || [])
    .map((guide) =>
      operations
        .map((operation) => qualifyOperation(guide, true, operation))
        .filter((i) => !!i)
    )
    .flat(1);

  const qualifiedAlways = (apiStandards.styleGuides?.always || [])
    .map((guide) =>
      operations
        .map((operation) => qualifyOperation(guide, false, operation))
        .filter((i) => !!i)
    )
    .flat(1);

  const standardsToApply = [...qualifiedAdded, ...qualifiedAlways] as {
    operation: OperationToTest;
    operationStandards: OperationStandard[];
  }[];

  standardsToApply.forEach((abc) => {
    abc.operationStandards.forEach((def) => {
      applyOperationStandard(abc.operation, def);
    });
  });
}

function collectOperations(
  currentFacts: IFact[],
  nextFacts: IFact[],
  changelog: IChange[]
): OperationToTest[] {
  const afterOperations = nextFacts.filter(
    (fact) => fact.location.kind === OpenApiKind.Operation
  ) as FactVariant<OpenApiKind.Operation>[];

  const operationChanges = changelog.filter(
    (change) => change.location.kind === OpenApiKind.Operation
  ) as ChangeVariant<OpenApiKind.Operation>[];

  const operations: OperationToTest[] = [];

  operationChanges.forEach((change) => {
    if (change.added) {
      operations.push({
        method: change.added.method,
        pathPattern: change.added.pathPattern,
        afterFact: change.added,
        lifecycle: 'added',
      });
    } else if (change.removed) {
      operations.push({
        method: change.removed.before.method,
        pathPattern: change.removed.before.pathPattern,
        beforeFact: change.removed.before,
        lifecycle: 'removed',
      });
    } else if (change.changed) {
      operations.push({
        method: change.changed.before.method,
        pathPattern: change.changed.before.pathPattern,
        beforeFact: change.changed.before,
        afterFact: change.changed.after,
        lifecycle: 'changed',
      });
    }
  });

  afterOperations.forEach((operation) => {
    // get everything in the spec that did not change
    if (
      operations.some(
        (op) =>
          op.pathPattern === operation.value.pathPattern &&
          op.method === operation.value.method
      )
    )
      return;
    operations.push({
      method: operation.value.method,
      pathPattern: operation.value.pathPattern,
      afterFact: operation.value,
    });
  });

  return operations;
}
