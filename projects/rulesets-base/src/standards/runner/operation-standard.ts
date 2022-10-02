import {
  ChangeVariant,
  FactVariant,
  IChange,
  IFact,
  OpenApiKind,
  OpenApiOperationFact,
  OpenAPIV3,
  Result,
} from '@useoptic/openapi-utilities';
import { ApiStandards } from '../standard';
import { OpenApiStandard, OperationStandard } from '../open-api-standard';
import { Paths } from '../entity/path-rules';
import exp from 'constants';
import { testEntityAttributes } from './test-entity';

export function qualifyOperation(
  standard: OpenApiStandard,
  onAdded: boolean,
  operation: OperationToTest
):
  | false
  | { operation: OperationToTest; operationStandards: OperationStandard[] } {
  const pathMatchers = Object.keys(standard.paths || {});

  if (onAdded && 'lifecycle' in operation && operation.lifecycle !== 'added')
    return false;

  const operationStandards: OperationStandard[] = [];

  pathMatchers.forEach((pathMatcher) => {
    // match with a programmatic predicate

    const didMatchPath = (() => {
      if (pathMatcher.startsWith('id:')) {
        const pathPredicate = Paths.__lookupPredicate(pathMatcher);
        if (pathPredicate)
          return pathPredicate(
            operation.pathPattern,
            operationToContext(operation)
          );
      } else if (pathMatcher === operation.pathPattern) {
        return true;
      } else if (pathMatcher === '*') return true;
      // also do blob maybe

      return false;
    })();

    if (didMatchPath) {
      const methods = Object.keys(standard.paths![pathMatcher] || {});
      methods.forEach((methodMatcher) => {
        if (methodMatcher === '*') {
          operationStandards.push(
            standard.paths![pathMatcher]![methodMatcher]!
          );
        } else if (operation.method === methodMatcher) {
          operationStandards.push(
            standard.paths![pathMatcher]![methodMatcher]!
          );
        }
      });
    }
  });

  if (operationStandards.length > 0) {
    return { operation, operationStandards };
  } else return false;
}

export function applyOperationStandard(
  operation: OperationToTest,
  operationStandards: OperationStandard
): Result[] {
  const before = 'beforeFact' in operation ? operation.beforeFact : undefined;
  const after = 'afterFact' in operation ? operation.afterFact : undefined;
  const lifecycle = 'lifecycle' in operation ? operation.lifecycle : undefined;

  const tester = testEntityAttributes(
    before,
    after,
    operationStandards,
    lifecycle
  );

  // these are the attributes that can be tested directly
  tester.testAll(['operationId', 'summary', 'tags']);

  if (operationStandards.parameters) {
    // apply the parameters standard
  }

  return tester.results();
}

function operationToContext(operationToTest: OperationToTest): {
  operation: OpenApiOperationFact;
  lifecycle?: 'added' | 'removed' | 'changed';
} {
  const lifecycle =
    'lifecycle' in operationToTest ? operationToTest.lifecycle : undefined;
  return {
    lifecycle,
    operation:
      lifecycle === 'removed' && 'beforeFact' in operationToTest
        ? operationToTest.beforeFact
        : // @ts-ignore
          operationToTest.afterFact,
  };
}

export type OperationToTest = {
  method: string;
  pathPattern: string;
} & (
  | { lifecycle: 'added'; afterFact: OpenApiOperationFact }
  | { lifecycle: 'removed'; beforeFact: OpenApiOperationFact }
  | {
      lifecycle: 'changed';
      beforeFact: OpenApiOperationFact;
      afterFact: OpenApiOperationFact;
    }
  | { afterFact: OpenApiOperationFact }
);
