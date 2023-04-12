export type Severity = 'info' | 'warn' | 'error';

export interface RuleResult {
  where: string;
  severity: Severity;
  error?: string;
  passed: boolean;
  exempted?: boolean;
  location: {
    jsonPath: string;
    spec: 'before' | 'after';
  };
  name: string;
  type?: 'requirement' | 'added' | 'changed' | 'removed' | 'addedOrChanged';
  docsLink?: string;
  expected?: string; // JSON string values
  received?: string; // JSON string values
}
