import { ChangeType, IChange, IFact } from '@useoptic/openapi-utilities';
import pick from 'lodash.pick';
import { RuleError } from '../errors';
import {
  Assertion,
  ChangedAssertion,
  Assertions,
  AssertionType,
  AssertionTypeToValue,
} from '../types';

// TODO figure out how to add on specific assertion helpers

type AssertionLifecycle = 'requirement' | 'added' | 'changed' | 'removed';

export type AssertionResult =
  | {
      passed: true;
      changeOrFact: IChange | IFact;
      condition: string;
      type: AssertionLifecycle;
      error?: undefined;
    }
  | {
      passed: false;
      changeOrFact: IChange | IFact;
      condition: string;
      type: AssertionLifecycle;
      error: string;
    };

export const assertionLifecycleToText = (
  assertionLifecycle: AssertionResult['type']
): string =>
  assertionLifecycle === 'requirement'
    ? `${assertionLifecycle} for`
    : assertionLifecycle;

class AssertionRunner<T extends AssertionType> implements Assertions<T> {
  private requirementAssertions: [string, Parameters<Assertion<T>>[1]][];
  private addedAssertions: [string, Parameters<Assertion<T>>[1]][];
  private changedAssertions: [string, Parameters<ChangedAssertion<T>>[1]][];
  private removedAssertions: [string, Parameters<Assertion<T>>[1]][];

  constructor() {
    this.requirementAssertions = [];
    this.addedAssertions = [];
    this.changedAssertions = [];
    this.removedAssertions = [];
  }

  requirement: Assertion<T> = (condition, assertion) => {
    this.requirementAssertions.push([condition, assertion]);
  };

  added: Assertion<T> = (condition, assertion) => {
    this.addedAssertions.push([condition, assertion]);
  };

  changed: ChangedAssertion<T> = (condition, assertion) => {
    this.changedAssertions.push([condition, assertion]);
  };

  removed: Assertion<T> = (condition, assertion) => {
    this.removedAssertions.push([condition, assertion]);
  };

  runBefore(
    before: AssertionTypeToValue[T],
    change: IChange | null
  ): AssertionResult[] {
    const results: AssertionResult[] = [];

    if (
      change &&
      change.changeType === ChangeType.Removed &&
      this.removedAssertions.length > 0
    ) {
      for (const [condition, assertion] of this.removedAssertions) {
        try {
          assertion(before);
          results.push({
            passed: true,
            changeOrFact: pick(
              change,
              'changeType',
              'added',
              'removed',
              'changed',
              'location'
            ) as IChange,
            condition,
            type: 'removed',
          });
        } catch (e) {
          if (e instanceof RuleError) {
            results.push({
              passed: false,
              changeOrFact: pick(
                change,
                'changeType',
                'added',
                'removed',
                'changed',
                'location'
              ) as IChange,
              condition,
              error: e.toString(),
              type: 'removed',
            });
          }
        }
      }
    }

    return results;
  }

  runAfter(
    before: AssertionTypeToValue[T] | null,
    after: AssertionTypeToValue[T],
    change: IChange | null
  ): AssertionResult[] {
    const results: AssertionResult[] = [];
    if (this.requirementAssertions.length > 0) {
      for (const [condition, assertion] of this.requirementAssertions) {
        try {
          // location
          // value
          assertion(after);
          results.push({
            passed: true,
            changeOrFact: pick(after, 'value', 'location') as IFact,
            condition,
            type: 'requirement',
          });
        } catch (e) {
          if (e instanceof RuleError) {
            results.push({
              passed: false,
              changeOrFact: pick(after, 'value', 'location') as IFact,
              condition,
              error: e.toString(),
              type: 'requirement',
            });
          }
        }
      }
    }

    if (
      change &&
      change.changeType === ChangeType.Added &&
      this.addedAssertions.length > 0
    ) {
      for (const [condition, assertion] of this.addedAssertions) {
        try {
          assertion(after);
          results.push({
            passed: true,
            changeOrFact: pick(
              change,
              'changeType',
              'added',
              'removed',
              'changed',
              'location'
            ) as IChange,
            condition,
            type: 'added',
          });
        } catch (e) {
          if (e instanceof RuleError) {
            results.push({
              passed: false,
              changeOrFact: pick(
                change,
                'changeType',
                'added',
                'removed',
                'changed',
                'location'
              ) as IChange,
              condition,
              error: e.toString(),
              type: 'added',
            });
          }
        }
      }
    }

    if (
      before &&
      change &&
      change.changeType === ChangeType.Changed &&
      this.changedAssertions.length > 0
    ) {
      for (const [condition, assertion] of this.changedAssertions) {
        try {
          assertion(before, after);
          results.push({
            passed: true,
            changeOrFact: pick(
              change,
              'changeType',
              'added',
              'removed',
              'changed',
              'location'
            ) as IChange,
            condition,
            type: 'changed',
          });
        } catch (e) {
          if (e instanceof RuleError) {
            results.push({
              passed: false,
              changeOrFact: pick(
                change,
                'changeType',
                'added',
                'removed',
                'changed',
                'location'
              ) as IChange,
              condition,
              error: e.toString(),
              type: 'changed',
            });
          }
        }
      }
    }
    return results;
  }
}

type OperationAssertionsRunner = AssertionRunner<'operation'> & {
  queryParameter: AssertionRunner<'query-parameter'>;
  headerParameter: AssertionRunner<'header-parameter'>;
  pathParameter: AssertionRunner<'path-parameter'>;
};

type RequestAssertionsRunner = {
  body: AssertionRunner<'request-body'>;
  property: AssertionRunner<'property'>;
};

type ResponseAssertionsRunner = {
  header: AssertionRunner<'response-header'>;
};

type ResponseBodyAssertionsRunner = {
  body: AssertionRunner<'response-body'>;
  property: AssertionRunner<'property'>;
};

export const createSpecificationAssertions =
  (): AssertionRunner<'specification'> => {
    return new AssertionRunner<'specification'>();
  };

export const createOperationAssertions = (): OperationAssertionsRunner => {
  const operationAssertions: any = new AssertionRunner<'operation'>();
  const queryParameterAssertions = new AssertionRunner<'query-parameter'>();
  const headerParameterAssertions = new AssertionRunner<'header-parameter'>();
  const pathParameterAssertions = new AssertionRunner<'path-parameter'>();

  operationAssertions.queryParameter = queryParameterAssertions;
  operationAssertions.headerParameter = headerParameterAssertions;
  operationAssertions.pathParameter = pathParameterAssertions;

  return operationAssertions as OperationAssertionsRunner;
};

export const createRequestAssertions = (): RequestAssertionsRunner => {
  const requestAssertions: any = {};
  const bodyAssertions = new AssertionRunner<'request-body'>();
  const propertyAssertions = new AssertionRunner<'property'>();

  requestAssertions.body = bodyAssertions;
  requestAssertions.property = propertyAssertions;

  return requestAssertions as RequestAssertionsRunner;
};

export const createResponseAssertions = (): ResponseAssertionsRunner => {
  const responseAssertions: any = {};
  const headerAssertions = new AssertionRunner<'response-header'>();

  responseAssertions.header = headerAssertions;

  return responseAssertions as ResponseAssertionsRunner;
};

export const createResponseBodyAssertions =
  (): ResponseBodyAssertionsRunner => {
    const responseBodyAssertions: any = {};
    const headerAssertions = new AssertionRunner<'response-header'>();
    const bodyAssertions = new AssertionRunner<'response-body'>();
    const propertyAssertions = new AssertionRunner<'property'>();

    responseBodyAssertions.header = headerAssertions;
    responseBodyAssertions.body = bodyAssertions;
    responseBodyAssertions.property = propertyAssertions;

    return responseBodyAssertions as ResponseBodyAssertionsRunner;
  };
