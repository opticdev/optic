import {
  ChangeType,
  ObjectDiff,
  RuleResult,
  Severity,
  SeverityText,
  SeverityTextOptions,
  FlatOpenAPIV3,
  FlatOpenAPIV3_1,
} from '@useoptic/openapi-utilities';
import Ajv from 'ajv';
import { appliesWhen } from './constants';
import {
  LintGptClient,
  LintgptEval,
  LintgptRulesHelper,
  PreparedRule,
  computeNodeChecksum,
  computeRuleChecksum,
} from './rules-helper';
import { ExternalRuleBase } from '@useoptic/rulesets-base/build/rules/external-rule-base';
import { OpenAPIFactNodes } from '@useoptic/rulesets-base/build/rule-runner/rule-runner-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';
import stableStringify from 'json-stable-stringify';
import { prepareOperation, prepareResponse } from './prepare-openapi';

export type LintGptConfig = {
  [key: string]: {
    required_on?: (typeof appliesWhen)[number];
    severity?: SeverityText;
    rules: string[];
  };
};

const ajv = new Ajv();

const configSchema = {
  type: 'object',
  patternProperties: {
    '.+': {
      type: 'object',
      required: ['rules'],
      properties: {
        severity: {
          type: 'string',
          enum: SeverityTextOptions,
        },
        required_on: {
          type: 'string',
          enum: appliesWhen,
        },
        rules: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  },
};

const validateConfigSchema = ajv.compile(configSchema);

export class LintGpt extends ExternalRuleBase {
  static async fromOpticConfig(
    config: unknown,
    { client }: { client: LintGptClient }
  ): Promise<LintGpt | string> {
    const result = validateConfigSchema(config);

    if (!result) {
      return `- ${ajv.errorsText(validateConfigSchema.errors, {
        separator: '\n- ',
        dataVar: 'ruleset/lintgpt',
      })}`;
    }

    const validatedConfig = config as LintGptConfig;
    const requirementRules: PreparedRule[] = [];
    const addedRules: PreparedRule[] = [];
    const lintgptRulesHelper = new LintgptRulesHelper(client);

    const rules: string[] = [];

    for (const [, config] of Object.entries(validatedConfig)) {
      for (const rule of config.rules) {
        rules.push(rule);
      }
    }

    const results = await lintgptRulesHelper.getRulePreps(rules);

    for (const [, config] of Object.entries(validatedConfig)) {
      for (const rule of config.rules) {
        const rule_checksum = computeRuleChecksum(rule);
        const result = results.get(rule_checksum);
        if (result?.prep?.prep_result) {
          if (
            config.required_on === 'added' ||
            config.required_on === 'addedOrChanged'
          ) {
            addedRules.push(result.prep.prep_result);
          } else {
            requirementRules.push(result.prep.prep_result);
          }
        }
      }
    }

    return new LintGpt(validatedConfig, requirementRules, addedRules, client);
  }

  constructor(
    private config: LintGptConfig,
    private requirementRules: PreparedRule[],
    private addedRules: PreparedRule[],
    private lintgptClient: LintGptClient
  ) {
    super();
  }

  async runRulesV2(inputs: {
    context: any;
    diffs: ObjectDiff[];
    fromSpec: FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document;
    toSpec: FlatOpenAPIV3.Document | FlatOpenAPIV3_1.Document;
    groupedFacts: OpenAPIFactNodes;
  }): Promise<RuleResult[]> {
    const operationsToRun: AIRuleRunInputs[] = [];
    const responsesToRun: AIRuleRunInputs[] = [];
    const propertiesToRun: AIRuleRunInputs[] = [];

    const lintgptRulesHelper = new LintgptRulesHelper(this.lintgptClient);

    inputs.groupedFacts.endpoints.forEach((endpoint) => {
      const { path, method } = endpoint;

      const location = `${method} ${path}`;
      const didChange = endpoint.change?.changeType === ChangeType.Changed;
      const wasRemoved = endpoint.change?.changeType === ChangeType.Removed;
      const jsonPath = (endpoint.after?.location.jsonPath ||
        endpoint.before?.location.jsonPath)!;

      const inAfterSpec = endpoint.after !== null;
      if (inAfterSpec) {
        operationsToRun.push({
          locationContext: location,
          jsonPath,
          value: wasRemoved
            ? undefined
            : prepareOperation(jsonPointerHelpers.get(inputs.toSpec, jsonPath)),
          before: didChange
            ? prepareOperation(
                jsonPointerHelpers.get(
                  inputs.fromSpec,
                  endpoint.before?.location.jsonPath!
                )
              )
            : undefined,
        });
      }

      endpoint.responses.forEach((response) => {
        const location = `${method} ${path} ${response.statusCode} response`;
        const didChange = response.change?.changeType === ChangeType.Changed;
        const wasRemoved = response.change?.changeType === ChangeType.Removed;

        response.bodies.forEach((body) => {
          body.fields.forEach((property) => {
            if (property.after) {
              const propertyLocation = `Name: \`${property.after.value.key}\`. Required? \`${property.after.value.required}\``;
              const didChange =
                property.change?.changeType === ChangeType.Changed;
              const wasRemoved =
                property.change?.changeType === ChangeType.Removed;

              propertiesToRun.push({
                locationContext: propertyLocation,
                jsonPath: property.after.location.jsonPath,
                value: wasRemoved
                  ? undefined
                  : jsonPointerHelpers.get(
                      inputs.toSpec,
                      property.after.location.jsonPath
                    ),
                before: didChange
                  ? jsonPointerHelpers.get(
                      inputs.fromSpec,
                      property.before!.location.jsonPath
                    )
                  : undefined,
              });
            }
          });
        });

        responsesToRun.push({
          locationContext: location,
          jsonPath,
          value: wasRemoved
            ? undefined
            : prepareResponse(jsonPointerHelpers.get(inputs.toSpec, jsonPath)),
          before: didChange
            ? prepareResponse(
                jsonPointerHelpers.get(
                  inputs.fromSpec,
                  response.before?.location.jsonPath!
                )
              )
            : undefined,
        });
      });
    });

    ///// run the rules

    const operationsRules = this.requirementRules.filter(
      (i) => i.entity === 'OPERATION'
    );

    const responsesRules = this.requirementRules.filter(
      (i) => i.entity === 'RESPONSE'
    );

    const propertyRules = this.requirementRules.filter(
      (i) => i.entity === 'PROPERTY'
    );

    const evals = new Map<
      string,
      { eval_data: any; jsonPath: string; rule: PreparedRule }
    >();

    for (const rule of operationsRules) {
      for (const operation of operationsToRun) {
        if (rule.changed && !operation.before) continue;
        const rule_checksum = computeRuleChecksum(rule.rule);
        const eval_data = {
          rule_checksum,
          location_context: operation.locationContext,
          node: stableStringify(operation.value ?? ''),
          node_before: stableStringify(operation.before ?? ''),
        };
        const node_checksum = computeNodeChecksum(eval_data);
        const key = `${rule_checksum}${node_checksum}`;
        evals.set(key, { eval_data, jsonPath: operation.jsonPath, rule });
      }
    }

    for (const rule of responsesRules) {
      for (const response of responsesToRun) {
        if (rule.changed && !response.before) continue;
        const rule_checksum = computeRuleChecksum(rule.rule);
        const eval_data = {
          rule_checksum,
          location_context: response.locationContext,
          node: stableStringify(response.value ?? ''),
          node_before: stableStringify(response.before ?? ''),
        };
        const node_checksum = computeNodeChecksum(eval_data);
        const key = `${rule_checksum}${node_checksum}`;
        evals.set(key, { eval_data, jsonPath: response.jsonPath, rule });
      }
    }

    for (const rule of propertyRules) {
      for (const property of propertiesToRun) {
        if (rule.changed && !property.before) continue;
        const rule_checksum = computeRuleChecksum(rule.rule);
        const eval_data = {
          rule_checksum,
          location_context: property.locationContext,
          node: stableStringify(property.value ?? ''),
          node_before: stableStringify(property.before ?? ''),
        };
        const node_checksum = computeNodeChecksum(eval_data);
        const key = `${rule_checksum}${node_checksum}`;
        evals.set(key, { eval_data, jsonPath: property.jsonPath, rule });
      }
    }

    const eval_results = await lintgptRulesHelper.getRuleEvals(
      [...evals.values()].map((v) => v.eval_data)
    );

    const results: RuleResult[] = [];

    const successfulEvals = [...eval_results.values()]
      .map((v) => v.rule_eval)
      .filter((v): v is LintgptEval => v?.status === 'success');

    if (successfulEvals.length < evals.size) {
      console.warn(
        `${
          evals.size - successfulEvals.length
        } LintGPT rule evaluations failed to run.`
      );
      console.warn('');
    }

    for (const result of successfulEvals) {
      if (result.skipped) continue;
      const key = `${result.rule_checksum}${result.node_checksum}`;
      const data = evals.get(key);
      if (!data) continue;
      const opticResult: RuleResult = {
        passed: !!result.passed,
        where: data.eval_data.location_context,
        name: data.rule.slug,
        severity:
          data.rule.severity === 'ERROR' ? Severity.Error : Severity.Warn,
        location: {
          jsonPath: data.jsonPath,
          spec: 'after',
        },
        error: result.eval_error ?? undefined,
      };
      results.push(opticResult);
    }

    return results;
  }
}

type AIRuleRunInputs = {
  locationContext: string;
  value: any;
  before?: any;
  jsonPath: string;
};
