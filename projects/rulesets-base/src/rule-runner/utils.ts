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

export const createRuleContext = ({
  specification,
  specificationNode,
  custom,
  operation,
  operationChangeType,
}: {
  specification: Specification;
  specificationNode: NodeDetail<OpenApiKind.Specification>;
  custom: any;
} & (
  | { operation?: undefined; operationChangeType?: undefined }
  | {
      operation: Operation;
      operationChangeType: RuleContext['operation']['change'];
    }
)): RuleContext => {
  if (operation && operationChangeType !== undefined) {
    return {
      custom,
      specification: {
        ...specification,
        change: getSpecificationChange(specificationNode),
      },
      operation: {
        ...operation,
        change: operationChangeType,
      },
    };
  } else {
    return {
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
  }
};


export const isExempted = (raw: object, ruleName: string) => {
  const exemptions = raw['x-optic-exemptions'];
  return (
    exemptions === ruleName ||
    (Array.isArray(exemptions) && exemptions.includes(ruleName))
  );
};
