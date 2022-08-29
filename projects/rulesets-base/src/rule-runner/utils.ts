import { OpenApiKind } from '@useoptic/openapi-utilities';
import { Operation, RuleContext, Specification } from '../types';
import { NodeDetail } from './rule-runner-types';

const getSpecificationChange = (
  specificationNode: NodeDetail<OpenApiKind.Specification>
) => {
  return specificationNode.after?.value['x-optic-ci-empty-spec'] === true
    ? 'removed'
    : specificationNode.before?.value['x-optic-ci-empty-spec'] === true
    ? 'added'
    : specificationNode.change?.changeType || null;
};

export const createRuleContextWithoutOperation = (
  specification: {
    node: NodeDetail<OpenApiKind.Specification>;
  } & (
    | { before: Specification | null; after: Specification }
    | { before: Specification; after: null }
  ),
  custom: any
): RuleContext => {
  const specificationChange = getSpecificationChange(specification.node)

  return {
    custom,
    specification: {
      ...(specificationChange === 'removed' ? specification.before! : specification.after!),
      change: specificationChange,
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
      raw: {
        responses: {},
      },
      change: null,
      queryParameters: new Map(),
      pathParameters: new Map(),
      headerParameters: new Map(),
      cookieParameters: new Map(),
      requests: [],
      responses: new Map(),
    },
  };
};

export const createRuleContextWithOperation = (
  specification: {
    node: NodeDetail<OpenApiKind.Specification>
  }
    & (
      | { before: Specification | null; after: Specification }
      | { before: Specification; after: null }
    ),
    operation: {
      node: NodeDetail<OpenApiKind.Operation>
    }
      & (
        | { before: Operation | null; after: Operation }
        | { before: Operation; after: null }
      ),
  custom: any
): RuleContext => {
  return {
    custom,
    specification: {
      ...(specification.after ? specification.after : specification.before),
      change: getSpecificationChange(specification.node),
    },
    operation: {
      ...(operation.after ? operation.after : operation.before),
      change:operation.node.change?.changeType || null
    },
  };
};

export const isExempted = (raw: object, ruleName: string) => {
  const exemptions = raw['x-optic-exemptions'];
  return (
    exemptions === ruleName ||
    (Array.isArray(exemptions) && exemptions.includes(ruleName))
  );
};
