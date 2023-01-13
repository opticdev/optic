export interface RuleResult {
  where: string;
  error?: string;
  passed: boolean;
  exempted?: boolean;
  jsonPath: string;
  name: string;
  type?: 'requirement' | 'added' | 'changed' | 'removed' | 'addedOrChanged';
  docsLink?: string;
  expected?: string; // JSON string values
  received?: string; // JSON string values
}
