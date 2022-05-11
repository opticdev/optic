import { OpenApiKind } from '@useoptic/openapi-utilities';
import { Operation, RuleContext, Specification } from '../types';
import { NodeDetail } from './rule-runner-types';

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

const getSpecificationChange = (
  specificationNode: NodeDetail<OpenApiKind.Specification>
) => {
  return specificationNode.after?.value['x-optic-ci-empty-spec'] === true
    ? 'removed'
    : specificationNode.before?.value['x-optic-ci-empty-spec'] === true
    ? 'added'
    : specificationNode.change?.changeType || null;
};

export const createSpecificationRuleContext = (
  specification: Specification,
  custom: any,
  specificationNode: NodeDetail<OpenApiKind.Specification>
): RuleContext => ({
  custom,
  specification: {
    ...specification,
    change: getSpecificationChange(specificationNode),
  },
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
    cookieParameters: new Map(),
    requests: [],
    responses: new Map(),
  },
});

export const createOperationContext = ({
  specification,
  specificationNode,
  operation,
  operationChangeType,
  custom,
}: {
  specification: Specification;
  specificationNode: NodeDetail<OpenApiKind.Specification>;
  operation: Operation;
  operationChangeType: RuleContext['operation']['change'];
  custom: any;
}): RuleContext => ({
  custom,
  specification: {
    ...specification,
    change: getSpecificationChange(specificationNode),
  },
  operation: {
    ...operation,
    change: operationChangeType,
  },
});
