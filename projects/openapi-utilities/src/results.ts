export function readSeverity(sev: 'info' | 'warn' | 'error'): Severity {
  return sev === 'info'
    ? Severity.Info
    : sev === 'warn'
    ? Severity.Warn
    : Severity.Error;
}

export enum Severity {
  Info = 0,
  Warn = 1,
  Error = 2,
}

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
