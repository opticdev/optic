import crypto from 'crypto';
import chunk from 'lodash.chunk';
import ora from 'ora';

type OpenAPIRuleType =
  | 'OPERATION'
  | 'PROPERTY'
  | 'REQUEST'
  | 'RESPONSE'
  | 'RESPONSE_HEADER'
  | 'PATH_PARAMETER'
  | 'QUERY_PARAMETER'
  | 'HEADER_PARAMETER';

type Severity = 'ERROR' | 'WARNING';

type CachedRulePrep = {
  rule_checksum: string;
  error?: string;
  status: 'requested' | 'success' | 'error';
  prep_result?: PreparedRule;
};

export type PreparedRule = {
  rule: string;
  changed: boolean;
  severity: Severity;
  slug: string;
  entity: OpenAPIRuleType;
};

export type LintgptEval = {
  rule_checksum: string;
  node_checksum: string;
  status: 'requested' | 'success' | 'failed';
  passed?: boolean | null;
  skipped?: boolean | null;
  error?: string | null; // Task failed
  eval_error?: string | null; // Rule did not pass
};

export type EvalRequest = {
  rule_checksum: string;
  location_context: string;
  node: string;
  node_before?: string;
};

export class LintgptRulesHelper {
  constructor() {}

  private getPrepSpinnerText = ({
    total,
    evaluated,
  }: {
    total: number;
    evaluated: number;
  }) => `LintGPT: ${evaluated}/${total} rules ready`;

  public async getRulePreps(rules: string[]) {
    const preparedRulesMap = new Map<
      string,
      { rule: string; rule_checksum: string; prep?: CachedRulePrep }
    >();

    let spinner = ora({
      text: this.getPrepSpinnerText({
        total: rules.length,
        evaluated: 0,
      }),
    });

    spinner.start();
    spinner.fail(`LintGPT: no longer supported`);
  }

  public async getRuleEvals(eval_requests: EvalRequest[]) {
    return new Map<
      string,
      {
        rule_checksum: string;
        node_checksum: string;
        eval_request: EvalRequest;
        rule_eval?: LintgptEval;
      }
    >();
  }
}

export const computeRuleChecksum = (rule: string): string =>
  crypto
    .createHash('sha256')
    .update(rule ?? '')
    .digest('base64')
    .toString();

export const computeNodeChecksum = ({
  node,
  node_before,
  location_context,
}: {
  node: string;
  location_context: string;
  node_before?: string;
}): string =>
  crypto
    .createHash('sha256')
    .update(location_context)
    .update(node ?? '')
    .update(node_before ?? '')
    .digest('base64')
    .toString();

const getEvalKey = (rule_checksum: string, node_checksum: string) =>
  `${rule_checksum}${node_checksum}`;
