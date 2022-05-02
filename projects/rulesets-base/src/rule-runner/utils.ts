import { OpenApiKind } from '@useoptic/openapi-utilities';
import { Operation, RuleContext } from '../types';

export const getRulesetRuleId = (rulesetName: string, ruleName: string) =>
  `${rulesetName}:${ruleName}`;

export const createRulesetMatcher =
  <T>({
    ruleMatcher: maybeRuleMatcher,
    rulesetMatcher: maybeRulesetMatcher,
  }: {
    ruleMatcher?: (item: T, ruleContext: RuleContext) => boolean;
    rulesetMatcher?: (ruleContext: RuleContext) => boolean;
  }) =>
  (item: T, ruleContext: RuleContext): boolean => {
    const ruleMatcher = maybeRuleMatcher || (() => true);
    const rulesetMatcher = maybeRulesetMatcher || (() => true);

    return ruleMatcher(item, ruleContext) && rulesetMatcher(ruleContext);
  };

export const getRuleAliases = (
  rulesetName: string,
  ruleName: string
): string[] => [getRulesetRuleId(rulesetName, ruleName), rulesetName];

export const createEmptyRuleContext = (custom: any): RuleContext => ({
  custom,
  operation: {
    location: {
      jsonPath: '',
      conceptualLocation: { path: '', method: '' },
      conceptualPath: [],
      kind: OpenApiKind.Operation,
    },
    value: { pathPattern: '', method: '' },
    path: '',
    method: '',
    raw: {},
    change: null,
    queryParameters: new Map(),
    pathParameters: new Map(),
    headerParameters: new Map(),
    requests: [],
    responses: new Map(),
  },
});

export const createBeforeOperationContext = (
  operation: Operation,
  custom: any
): RuleContext => ({
  custom,
  operation: {
    ...operation,
    change: null, // change is null for before operations
  },
});

export const createAfterOperationContext = (
  operation: Operation,
  custom: any,
  changeType: RuleContext['operation']['change']
): RuleContext => ({
  custom,
  operation: {
    ...operation,
    change: changeType,
  },
});
