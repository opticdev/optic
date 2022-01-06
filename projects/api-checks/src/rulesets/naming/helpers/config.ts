import { RuleApplies } from '../../shared-config';

export enum NameMustBe {
  none = 'none',
  snakeCase = 'snake_case',
  camelCase = 'camelCase',
  paramCase = 'param-case',
  pascalCase = 'PascalCase',
}

export interface NameRule {
  rule: NameMustBe;
  applies: RuleApplies;
}

export interface NamingChecksConfig {
  requestHeaders?: NameRule;
  queryParameters?: NameRule;
  requestProperties?: NameRule;
  responseProperties?: NameRule;
  responseHeaders?: NameRule;
}
