import { ChangeType, IChange, IFact } from '@useoptic/openapi-utilities';
import pick from 'lodash.pick';
import { RuleError, UserRuleError } from '../errors';
import {
  Assertion,
  ChangedAssertion,
  Assertions,
  AssertionType,
  AssertionTypeToValue,
  AssertionTypeToHelpers,
} from '../types';
import { createSpecificationHelpers } from './matchers/specification-matchers';
import { createOperationHelpers } from './matchers/operation-matchers';
import { createResponseHelpers } from './matchers/response-matchers';
import {
  CallableAssertion,
  CallableChangedAssertion,
} from './rule-runner-types';
import { createRequestBodyHelpers } from './matchers/request-body-matchers';
import { createResponseBodyHelpers } from './matchers/response-body-matchers';

type AssertionLifecycle = 'requirement' | 'added' | 'changed' | 'removed';

export type AssertionResult =
  | {
      passed: true;
      exempted?: boolean;
      changeOrFact: IChange | IFact;
      condition: string;
      type: AssertionLifecycle;
      error?: undefined;
      received?: undefined;
      expected?: undefined;
    }
  | {
      passed: false;
      exempted?: boolean;
      changeOrFact: IChange | IFact;
      condition: string;
      type: AssertionLifecycle;
      error: string;
      received?: string;
      expected?: string;
    };

const sanitizeFact = (fact: IFact): IFact =>
  pick(fact, 'value', 'location') as IFact;
const sanitizeChange = (change: IChange): IChange =>
  pick(
    change,
    'changeType',
    'added',
    'removed',
    'changed',
    'location'
  ) as IChange;

export const assertionLifecycleToText = (
  assertionLifecycle: AssertionResult['type']
): string =>
  assertionLifecycle === 'requirement'
    ? `${assertionLifecycle} for`
    : assertionLifecycle;

class AssertionRunner<T extends AssertionType> implements Assertions<T> {
  private requirementAssertions: [string, CallableAssertion<T>][];
  private addedAssertions: [string, CallableAssertion<T>][];
  private changedAssertions: [string, CallableChangedAssertion<T>][];
  private removedAssertions: [string, CallableAssertion<T>][];

  constructor(private type: T) {
    this.requirementAssertions = [];
    this.addedAssertions = [];
    this.changedAssertions = [];
    this.removedAssertions = [];
  }

  private createAssertionHelpers = (
    assertionKey:
      | 'requirementAssertions'
      | 'addedAssertions'
      | 'changedAssertions'
      | 'removedAssertions'
  ): AssertionTypeToHelpers[T] => {
    const registerAssertion = (
      condition: string,
      assertion: CallableAssertion<T>
    ) => {
      if (assertionKey === 'changedAssertions') {
        this.changedAssertions.push([
          condition,
          (before, after) => {
            assertion(after);
          },
        ]);
      } else {
        this[assertionKey].push([condition, assertion]);
      }
    };

    // ts cannot infer through the blocks here that the registerAssertion function and
    // the value match up - which means we have to cast `as any`
    return {
      specification: createSpecificationHelpers(registerAssertion as any),
      operation: createOperationHelpers(registerAssertion as any),
      'query-parameter': {},
      'path-parameter': {},
      'header-parameter': {},
      'cookie-parameter': {},
      response: createResponseHelpers(registerAssertion as any),
      'response-header': {},
      'request-body': createRequestBodyHelpers(registerAssertion as any),
      'response-body': createResponseBodyHelpers(registerAssertion as any),
      property: {},
    }[this.type];
  };

  private createAssertion = (
    key: 'requirementAssertions' | 'addedAssertions' | 'removedAssertions'
  ): Assertion<T> & AssertionTypeToHelpers[T] => {
    const baseAssertion: Assertion<T> = (condition, assertion) => {
      this[key].push([condition, assertion]);
    };
    for (const [k, v] of Object.entries(this.createAssertionHelpers(key))) {
      baseAssertion[k] = v;
    }
    return baseAssertion as Assertion<T> & AssertionTypeToHelpers[T];
  };

  private createChangedAssertion = (): ChangedAssertion<T> &
    AssertionTypeToHelpers[T] => {
    const baseAssertion: ChangedAssertion<T> = (condition, assertion) => {
      this.changedAssertions.push([condition, assertion]);
    };
    for (const [k, v] of Object.entries(
      this.createAssertionHelpers('changedAssertions')
    )) {
      baseAssertion[k] = v;
    }
    return baseAssertion as ChangedAssertion<T> & AssertionTypeToHelpers[T];
  };

  get requirement() {
    return this.createAssertion('requirementAssertions');
  }

  get added() {
    return this.createAssertion('addedAssertions');
  }

  get changed() {
    return this.createChangedAssertion();
  }

  get removed() {
    return this.createAssertion('removedAssertions');
  }

  runBefore(
    before: AssertionTypeToValue[T],
    change: IChange | null,
    exempted: boolean
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
            exempted,
            changeOrFact: sanitizeChange(change),
            condition,
            type: 'removed',
          });
        } catch (e) {
          if (e instanceof RuleError) {
            results.push({
              passed: false,
              exempted,
              changeOrFact: sanitizeChange(change),
              condition,
              error: e.toString(),
              received: JSON.stringify(e.details.received),
              expected: JSON.stringify(e.details.expected),
              type: 'removed',
            });
          } else {
            const err = e as Error;
            throw new UserRuleError(err);
          }
        }
      }
    }

    return results;
  }

  runAfter(
    before: AssertionTypeToValue[T] | null,
    after: AssertionTypeToValue[T],
    change: IChange | null,
    exempted: boolean
  ): AssertionResult[] {
    const results: AssertionResult[] = [];
    if (this.requirementAssertions.length > 0) {
      for (const [condition, assertion] of this.requirementAssertions) {
        try {
          assertion(after);
          results.push({
            passed: true,
            exempted,
            changeOrFact: sanitizeFact(after),
            condition,
            type: 'requirement',
          });
        } catch (e) {
          if (e instanceof RuleError) {
            results.push({
              passed: false,
              exempted,
              changeOrFact: sanitizeFact(after),
              condition,
              received: JSON.stringify(e.details.received),
              expected: JSON.stringify(e.details.expected),
              error: e.toString(),
              type: 'requirement',
            });
          } else {
            const err = e as Error;
            throw new UserRuleError(err);
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
            exempted,
            changeOrFact: sanitizeChange(change),
            condition,
            type: 'added',
          });
        } catch (e) {
          if (e instanceof RuleError) {
            results.push({
              passed: false,
              exempted,
              changeOrFact: sanitizeChange(change),
              condition,
              received: JSON.stringify(e.details.received),
              expected: JSON.stringify(e.details.expected),
              error: e.toString(),
              type: 'added',
            });
          } else {
            const err = e as Error;
            throw new UserRuleError(err);
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
            exempted,
            changeOrFact: sanitizeChange(change),
            condition,
            type: 'changed',
          });
        } catch (e) {
          if (e instanceof RuleError) {
            results.push({
              passed: false,
              exempted,
              changeOrFact: sanitizeChange(change),
              condition,
              received: JSON.stringify(e.details.received),
              expected: JSON.stringify(e.details.expected),
              error: e.toString(),
              type: 'changed',
            });
          } else {
            const err = e as Error;
            throw new UserRuleError(err);
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
  cookieParameter: AssertionRunner<'cookie-parameter'>;
};

type RequestAssertionsRunner = {
  body: AssertionRunner<'request-body'>;
  property: AssertionRunner<'property'>;
};

type ResponseAssertionsRunner = AssertionRunner<'response'> & {
  header: AssertionRunner<'response-header'>;
};

type ResponseBodyAssertionsRunner = {
  body: AssertionRunner<'response-body'>;
  property: AssertionRunner<'property'>;
};

export const createSpecificationAssertions =
  (): AssertionRunner<'specification'> => {
    return new AssertionRunner('specification');
  };

export const createOperationAssertions = (): OperationAssertionsRunner => {
  const operationAssertions: any = new AssertionRunner('operation');
  const queryParameterAssertions = new AssertionRunner('query-parameter');
  const headerParameterAssertions = new AssertionRunner('header-parameter');
  const pathParameterAssertions = new AssertionRunner('path-parameter');
  const cookieParameterAssertions = new AssertionRunner('cookie-parameter');

  operationAssertions.queryParameter = queryParameterAssertions;
  operationAssertions.headerParameter = headerParameterAssertions;
  operationAssertions.pathParameter = pathParameterAssertions;
  operationAssertions.cookieParameter = cookieParameterAssertions;

  return operationAssertions as OperationAssertionsRunner;
};

export const createRequestAssertions = (): RequestAssertionsRunner => {
  const requestAssertions: any = {};
  const bodyAssertions = new AssertionRunner('request-body');
  const propertyAssertions = new AssertionRunner('property');

  requestAssertions.body = bodyAssertions;
  requestAssertions.property = propertyAssertions;

  return requestAssertions as RequestAssertionsRunner;
};

export const createResponseAssertions = (): ResponseAssertionsRunner => {
  const responseAssertions: any = new AssertionRunner('response');
  const headerAssertions = new AssertionRunner('response-header');

  responseAssertions.header = headerAssertions;

  return responseAssertions as ResponseAssertionsRunner;
};

export const createResponseBodyAssertions =
  (): ResponseBodyAssertionsRunner => {
    const responseBodyAssertions: any = {};
    const headerAssertions = new AssertionRunner('response-header');
    const bodyAssertions = new AssertionRunner('response-body');
    const propertyAssertions = new AssertionRunner('property');

    responseBodyAssertions.header = headerAssertions;
    responseBodyAssertions.body = bodyAssertions;
    responseBodyAssertions.property = propertyAssertions;

    return responseBodyAssertions as ResponseBodyAssertionsRunner;
  };
