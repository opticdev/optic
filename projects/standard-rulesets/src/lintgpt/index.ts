import {
  ChangeType,
  IChange,
  IFact,
  ObjectDiff,
  OpenApiKind,
  OperationLocation,
  Result,
  RuleResult,
  Severity,
  SeverityText,
  SeverityTextOptions,
} from '@useoptic/openapi-utilities';
import Ajv from 'ajv';
import { appliesWhen } from './constants';
import { PreparedRule } from './prepare-rule';
import { NaiveLocalCache } from './rule-cache';
import { ExternalRuleBase } from '@useoptic/rulesets-base/build/rules/external-rule-base';
import { OpenAPIFactNodes } from '@useoptic/rulesets-base/build/rule-runner/rule-runner-types';
import { OpenAPIV3 } from 'openapi-types';
import { jsonPointerHelpers } from '@useoptic/json-pointer-helpers';

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
  static async fromOpticConfig(config: unknown): Promise<LintGpt | string> {
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
    const cache = new NaiveLocalCache();
    await cache.loadCache();

    for await (const [key, config] of Object.entries(validatedConfig)) {
      for await (const rule of config.rules) {
        const result = await cache.getOrPrepareRule(rule);
        if (result) {
          if (
            config.required_on === 'added' ||
            config.required_on === 'addedOrChanged'
          ) {
            addedRules.push({
              ...result,
            });
          } else {
            requirementRules.push({
              ...result,
            });
          }
        }
      }
    }

    await cache.flushCache();
    return new LintGpt(validatedConfig, requirementRules, addedRules);
  }

  private evaluation: NaiveLocalCache;
  constructor(
    private config: LintGptConfig,
    private requirementRules: PreparedRule[],
    private addedRules: PreparedRule[]
  ) {
    super();
    this.evaluation = new NaiveLocalCache();
  }

  async runRulesV2(inputs: {
    context: any;
    diffs: ObjectDiff[];
    fromSpec: OpenAPIV3.Document;
    toSpec: OpenAPIV3.Document;
    groupedFacts: OpenAPIFactNodes;
  }): Promise<RuleResult[]> {
    const operationsToRun: AIRuleRunInputs[] = [];
    const responsesToRun: AIRuleRunInputs[] = [];
    const propertiesToRun: AIRuleRunInputs[] = [];
    await await this.evaluation.loadCache();

    inputs.groupedFacts.endpoints.forEach((endpoint) => {
      const { path, method } = endpoint;

      const location = `${method} ${path}`;
      const didChange = endpoint.change?.changeType === ChangeType.Changed;
      const jsonPath = (endpoint.after?.location.jsonPath ||
        endpoint.before?.location.jsonPath)!;

      const inAfterSpec = endpoint.after !== null;
      if (inAfterSpec) {
        operationsToRun.push({
          locationContext: location,
          jsonPath,
          value: jsonPointerHelpers.get(inputs.toSpec, jsonPath),
          before: didChange
            ? jsonPointerHelpers.get(
                inputs.fromSpec,
                endpoint.before?.location.jsonPath!
              )
            : undefined,
        });
      }

      endpoint.responses.forEach((responses) => {
        const location = `${method} ${path} ${responses.statusCode} response`;
        const didChange = responses.change?.changeType === ChangeType.Changed;

        responses.bodies.forEach((body) => {
          body.fields.forEach((property) => {
            if (property.after) {
              const propertyLocation = `${method} ${path} ${responses.statusCode} response property. Name: \`${property.after.value.key}\`. Required? \`${property.after.value.required}\``;
              const didChange =
                property.change?.changeType === ChangeType.Changed;

              propertiesToRun.push({
                locationContext: propertyLocation,
                jsonPath: property.after.location.jsonPath,
                value: jsonPointerHelpers.get(
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
          value: jsonPointerHelpers.get(inputs.toSpec, jsonPath),
          before: didChange
            ? jsonPointerHelpers.get(
                inputs.fromSpec,
                responses.before?.location.jsonPath!
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

    const operationRuleResults = (
      await Promise.all(
        operationsRules.map(async (rule) => {
          return Promise.all(
            operationsToRun.map(async (operation) => {
              if (rule.changed && !operation.before) {
                return null;
              }
              const result = await this.evaluation.getOrEvaluateRule(
                rule,
                operation.locationContext,
                operation.value,
                operation.before
              );

              if ('skipped' in result) {
                return null;
              } else if ('passed' in result) {
                const opticResult: RuleResult = {
                  passed: result.passed,
                  where: operation.locationContext,
                  name: rule.slug,
                  severity:
                    rule.severity === 'ERROR' ? Severity.Error : Severity.Warn,
                  location: {
                    jsonPath: operation.jsonPath,
                    spec: 'after',
                  },
                  error: 'error' in result ? result.error : undefined,
                };
                return opticResult;
              }
            })
          );
        })
      )
    )
      .flat(2)
      .filter((i) => Boolean(i)) as RuleResult[];

    const responsesRuleResults = (
      await Promise.all(
        responsesRules.map(async (rule) => {
          return Promise.all(
            responsesToRun.map(async (response) => {
              if (rule.changed && !response.before) {
                return null;
              }
              const result = await this.evaluation.getOrEvaluateRule(
                rule,
                response.locationContext,
                response.value,
                response.before
              );

              if ('skipped' in result) {
                return null;
              } else if ('passed' in result) {
                const opticResult: RuleResult = {
                  passed: result.passed,
                  where: response.locationContext,
                  name: rule.slug,
                  severity:
                    rule.severity === 'ERROR' ? Severity.Error : Severity.Warn,
                  location: {
                    jsonPath: response.jsonPath,
                    spec: 'after',
                  },
                  error: 'error' in result ? result.error : undefined,
                };
                return opticResult;
              }
            })
          );
        })
      )
    )
      .flat(2)
      .filter((i) => Boolean(i)) as RuleResult[];

    const propertyRuleResults = (
      await Promise.all(
        propertyRules.map(async (rule) => {
          return Promise.all(
            propertiesToRun.map(async (property) => {
              if (rule.changed && !property.before) {
                return null;
              }
              const result = await this.evaluation.getOrEvaluateRule(
                rule,
                property.locationContext,
                property.value,
                property.before
              );

              if ('skipped' in result) {
                return null;
              } else if ('passed' in result) {
                const opticResult: RuleResult = {
                  passed: result.passed,
                  where: property.locationContext,
                  name: rule.slug,
                  severity:
                    rule.severity === 'ERROR' ? Severity.Error : Severity.Warn,
                  location: {
                    jsonPath: property.jsonPath,
                    spec: 'after',
                  },
                  error: 'error' in result ? result.error : undefined,
                };
                return opticResult;
              }
            })
          );
        })
      )
    )
      .flat(2)
      .filter((i) => Boolean(i)) as RuleResult[];

    await this.evaluation.flushCache();
    return [
      ...operationRuleResults,
      ...responsesRuleResults,
      ...propertyRuleResults,
    ];
  }
}

type AIRuleRunInputs = {
  locationContext: string;
  value: any;
  before?: any;
  jsonPath: string;
};
