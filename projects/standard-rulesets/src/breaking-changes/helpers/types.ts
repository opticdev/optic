import { AssertionType } from '@useoptic/rulesets-base';

export type ParameterIn = 'cookie' | 'query' | 'header' | 'path';
export type ParamAssertionType = Extract<
  AssertionType,
  'query-parameter' | 'path-parameter' | 'header-parameter' | 'cookie-parameter'
>;
