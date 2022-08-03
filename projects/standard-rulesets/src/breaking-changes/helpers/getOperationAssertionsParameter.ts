import { Assertions, OperationAssertions } from '@useoptic/rulesets-base';
import { ParameterIn, ParamAssertionType } from './types';

const unhandledCase = (x: never) => {
  throw new Error(`received unexpected runtime value ${x}`);
};

export const getOperationAssertionsParameter = (
  operationAssertions: OperationAssertions,
  parameterIn: ParameterIn
): Assertions<ParamAssertionType> => {
  switch (parameterIn) {
    case 'query':
      return operationAssertions.queryParameter;
    case 'path':
      return operationAssertions.pathParameter;
    case 'cookie':
      return operationAssertions.cookieParameter;
    case 'header':
      return operationAssertions.headerParameter;
    default:
      return unhandledCase(parameterIn);
  }
};
