import {
  OperationRule,
  PropertyRule,
  RuleError,
} from '@useoptic/rulesets-base';
import {
  IChange,
  IFact,
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
              severity: config.severity
                ? config.severity
                  ? 'error'
                    ? 'ERROR'
                    : 'WARNING'
                  : result.severity
                : 'WARNING',
            });
          } else {
            requirementRules.push({
              ...result,
              severity: config.severity
                ? config.severity
                  ? 'error'
                    ? 'ERROR'
                    : 'WARNING'
                  : result.severity
                : 'WARNING',
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

  async runRules(inputs: {
    context: any;
    nextFacts: IFact[];
    currentFacts: IFact[];
    changelog: IChange[];
    nextJsonLike: OpenAPIV3.Document;
    currentJsonLike: OpenAPIV3.Document;
    groupedFacts: OpenAPIFactNodes;
  }): Promise<Result[]> {
    await this.evaluation.loadCache();

    const results: Result[] = [];
    for await (const rule of this.requirementRules) {
      results.push(...(await this.runRule(rule, inputs, false)));
    }

    await this.evaluation.flushCache();
    return results;
  }

  async runRule(
    preparedRule: PreparedRule,
    inputs: {
      context: any;
      nextFacts: IFact[];
      currentFacts: IFact[];
      changelog: IChange[];
      nextJsonLike: OpenAPIV3.Document;
      currentJsonLike: OpenAPIV3.Document;
      groupedFacts: OpenAPIFactNodes;
    },
    addedOnly: boolean
  ): Promise<Result[]> {
    const examples: {
      location: string;
      jsonLocation: RuleResult['location'];
      value: any;
      before?: any;
    }[] = [];

    switch (preparedRule.entity) {
      case 'OPERATION':
        const operations = inputs.nextFacts.filter(
          (i) => i.location.kind === OpenApiKind.Operation
        );
        operations.forEach((operation) => {
          const location = operation.location
            .conceptualLocation as OperationLocation;
          examples.push({
            location: `${location.method} ${location.path}`,
            jsonLocation: {
              spec: 'after',
              jsonPath: operation.location.jsonPath,
            },
            value: jsonPointerHelpers.get(
              inputs.nextJsonLike,
              operation.location.jsonPath
            ),
            before: preparedRule.changed
              ? jsonPointerHelpers.get(
                  inputs.currentJsonLike,
                  operation.location.jsonPath
                )
              : undefined,
          });
        });
        break;
    }

    const ruleResults = Promise.all(
      examples.map(async (entity) => {
        try {
          const result = await this.evaluation.getOrEvaluateRule(
            preparedRule,
            entity.location,
            entity,
            entity.before
          );
          if ('skipped' in result && result.skipped) {
            return null;
          }
          if ('passed' in result) {
            const severity =
              preparedRule.severity === 'ERROR'
                ? Severity.Error
                : Severity.Warn;
            const opticResult: Result = {
              passed: result.passed,
              where: entity.location,
              name: preparedRule.rule,
              error: 'error' in result ? result.error : undefined,
              severity,
              isMust: severity === Severity.Error,
              // @ts-ignore
              change: null,
              isShould: severity === Severity.Warn,
              // location: entity.jsonLocation,
            };
            return opticResult;
          }
        } catch (e) {
          console.error('Lintgpt error ' + e);
          return null;
        }
      })
    );
    const resultsResolved = (await ruleResults).filter((i) =>
      Boolean(i)
    ) as Result[];
    return resultsResolved;
  }
}
