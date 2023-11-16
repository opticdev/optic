import crypto from 'crypto';

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

export type LintGptClient = {
  getLintgptPreps: (
    rule_checksums: string[]
  ) => Promise<{ lintgpt_preps: CachedRulePrep[] }>;
  requestLintgptPreps: (rules: string[]) => Promise<void>;
  getLintgptEvals: (
    evals: { rule_checksum: string; node_checksum: string }[]
  ) => Promise<{ lintgpt_evals: LintgptEval[] }>;
  requestLintgptEvals: (
    evals: {
      node: string;
      node_before?: string;
      location_context: string;
      rule_checksum: string;
    }[]
  ) => Promise<void>;
};

export type EvalRequest = {
  rule_checksum: string;
  location_context: string;
  node: string;
  node_before?: string;
};

export class LintgptRulesHelper {
  constructor(private client: LintGptClient) {}

  public async getRulePreps(rules: string[]) {
    const preparedRulesMap = new Map<
      string,
      { rule: string; rule_checksum: string; prep?: CachedRulePrep }
    >();

    for (const rule of rules) {
      const rule_checksum = computeRuleChecksum(rule);
      preparedRulesMap.set(rule_checksum, { rule, rule_checksum });
    }

    const getRulesWithoutPrep = () =>
      [...preparedRulesMap.values()].filter(
        ({ prep }) => !prep || prep.status === 'requested'
      );

    const maxTime = Date.now() + 5 * 60 * 1000;

    let rulesWithoutPreps = getRulesWithoutPrep();
    let firstRun = true;
    const pollInterval = 2000;

    while (rulesWithoutPreps.length && maxTime > Date.now()) {
      if (!firstRun)
        await new Promise((resolve) => setTimeout(resolve, pollInterval));

      const results = await this.client.getLintgptPreps(
        rulesWithoutPreps.map((r) => r.rule_checksum)
      );

      for (const result of results.lintgpt_preps) {
        preparedRulesMap.set(result.rule_checksum, {
          ...preparedRulesMap.get(result.rule_checksum)!,
          prep: result,
        });
      }

      rulesWithoutPreps = getRulesWithoutPrep();

      if (firstRun && rulesWithoutPreps.length) {
        const rulesToPrep = rulesWithoutPreps.map((r) => r.rule);
        await this.client.requestLintgptPreps(rulesToPrep);
      }

      firstRun = false;
    }

    return preparedRulesMap;
  }

  public async getRuleEvals(eval_requests: EvalRequest[]) {
    const evalsMap = new Map<
      string,
      {
        rule_checksum: string;
        node_checksum: string;
        eval_request: EvalRequest;
        rule_eval?: LintgptEval;
      }
    >();

    for (const eval_request of eval_requests) {
      const rule_checksum = eval_request.rule_checksum;
      const node_checksum = computeNodeChecksum(eval_request);
      const key = getEvalKey(rule_checksum, node_checksum);
      evalsMap.set(key, {
        eval_request,
        rule_checksum,
        node_checksum,
      });
    }

    const getRequestsWithoutEvals = () =>
      [...evalsMap.values()].filter(
        ({ rule_eval }) => !rule_eval || rule_eval.status === 'requested'
      );

    const maxTime = Date.now() + 10 * 60 * 1000;

    let requestsWithoutEvals = getRequestsWithoutEvals();
    let firstRun = true;
    const pollInterval = 2000;

    while (requestsWithoutEvals.length && maxTime > Date.now()) {
      if (!firstRun)
        await new Promise((resolve) => setTimeout(resolve, pollInterval));

      const queryData = requestsWithoutEvals.map((r) => ({
        rule_checksum: r.rule_checksum,
        node_checksum: r.node_checksum,
      }));
      const results = await this.client.getLintgptEvals(queryData);

      for (const result of results.lintgpt_evals) {
        const key = getEvalKey(result.rule_checksum, result.node_checksum);
        if (!evalsMap.has(key)) {
          continue;
        }
        evalsMap.set(key, {
          ...evalsMap.get(key)!,
          rule_eval: result,
        });
      }

      requestsWithoutEvals = getRequestsWithoutEvals();

      if (firstRun && requestsWithoutEvals.length) {
        const evalsToRequest = requestsWithoutEvals.map((r) => r.eval_request);
        await this.client.requestLintgptEvals(evalsToRequest);
      }

      firstRun = false;
    }

    return evalsMap;
  }
}

export const computeRuleChecksum = (rule: string): string =>
  crypto.createHash('sha256').update(rule).digest('base64').toString();

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
    .update(node)
    .update(node_before ?? '')
    .digest('base64')
    .toString();

const getEvalKey = (rule_checksum: string, node_checksum: string) =>
  `${rule_checksum}${node_checksum}`;
