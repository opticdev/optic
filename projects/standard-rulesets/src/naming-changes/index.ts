import { Ruleset, Rule } from '@useoptic/rulesets-base';
import { appliesWhen, casing, NamingConfig } from './constants';
import { createPropertyNamingChecks } from './propertyNames';
import { createQueryParameterChecks } from './queryParameters';
import { createRequestHeaderParameterChecks } from './requestHeaders';
import { createResponseHeaderParameterChecks } from './responseHeader';
import { createCookieParameterChecks } from './cookieParameters';
import { createPathComponentChecks } from './pathComponents';
import Ajv from 'ajv';

type RulesetConfig = {
  required_on?: typeof appliesWhen[number];
  requestHeaders?: typeof casing[number];
  queryParameters?: typeof casing[number];
  responseHeaders?: typeof casing[number];
  cookieParameters?: typeof casing[number];
  pathComponents?: typeof casing[number];
  properties?: typeof casing[number];
};

const ajv = new Ajv();
const configSchema = {
  type: 'object',
  properties: {
    required_on: {
      type: 'string',
      enum: appliesWhen,
    },
    requestHeaders: {
      type: 'string',
      enum: casing,
    },
    queryParameters: {
      type: 'string',
      enum: casing,
    },
    responseHeaders: {
      type: 'string',
      enum: casing,
    },
    cookieParameters: {
      type: 'string',
      enum: casing,
    },
    pathComponents: {
      type: 'string',
      enum: casing,
    },
    properties: {
      type: 'string',
      enum: casing,
    },
  },
};
const validateConfigSchema = ajv.compile(configSchema);

export class NamingChangesRuleset extends Ruleset<Rule[]> {
  static fromOpticConfig(config: unknown): NamingChangesRuleset | string {
    const result = validateConfigSchema(config);

    if (!result) {
      return `- ${ajv.errorsText(validateConfigSchema.errors, {
        separator: '\n- ',
        dataVar: 'ruleset/naming',
      })}`;
    }

    const validatedConfig = config as RulesetConfig;
    const namingConfig: NamingConfig = {};
    for (const key of [
      'requestHeaders',
      'queryParameters',
      'responseHeaders',
      'cookieParameters',
      'pathComponents',
      'properties',
    ]) {
      if (validatedConfig[key]) {
        namingConfig[key] = validatedConfig[key];
      }
    }

    return new NamingChangesRuleset({
      required_on: validatedConfig.required_on || 'always',
      options: namingConfig,
    });
  }

  constructor(config: {
    required_on: typeof appliesWhen[number];
    options?: NamingConfig;
    matches?: Ruleset['matches'];
  }) {
    if (!config) {
      // TODO silence this from sentry
      throw new Error('Expected config object in NamingChangesRuleset');
    }

    const { required_on, matches, options = {} } = config;
    if (!required_on || !appliesWhen.includes(required_on)) {
      // TODO silence this from sentry
      throw new Error(
        `Expected config.applies in NamingChangesRuleset to be specified and be one of ${appliesWhen.join(
          ', '
        )}`
      );
    }
    for (const [key, value] of Object.entries(options)) {
      if (!casing.includes(value)) {
        // TODO silence this from sentry
        throw new Error(
          `Expected casing option to be one of ${casing.join(
            ', '
          )}, received ${value} for ${key}`
        );
      }
    }

    // TODO create naming rules using options
    const namingChangeRules: Rule[] = [];
    if (options.properties) {
      namingChangeRules.push(
        ...createPropertyNamingChecks(required_on, options.properties)
      );
    }
    if (options.queryParameters) {
      namingChangeRules.push(
        createQueryParameterChecks(required_on, options.queryParameters)
      );
    }
    if (options.requestHeaders) {
      namingChangeRules.push(
        createRequestHeaderParameterChecks(required_on, options.requestHeaders)
      );
    }
    if (options.cookieParameters) {
      namingChangeRules.push(
        createCookieParameterChecks(required_on, options.cookieParameters)
      );
    }
    if (options.responseHeaders) {
      namingChangeRules.push(
        createResponseHeaderParameterChecks(required_on, options.responseHeaders)
      );
    }
    if (options.pathComponents) {
      namingChangeRules.push(
        createPathComponentChecks(required_on, options.pathComponents)
      );
    }

    super({
      name: 'Naming changes ruleset',
      matches,
      rules: namingChangeRules,
    });
  }
}
