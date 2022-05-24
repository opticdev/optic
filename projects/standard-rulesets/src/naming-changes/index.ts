import { Ruleset, Rule } from '@useoptic/rulesets-base';
import { appliesWhen, casing, NamingConfig } from './constants';
import { createPropertyNamingChecks } from './propertyNames';
import { createQueryParameterChecks } from './queryParameters';
import { createRequestHeaderParameterChecks } from './requestHeaders';
import { createResponseHeaderParameterChecks } from './responseHeader';
import { createCookieParameterChecks } from './cookieParameters';
import { createPathComponentChecks } from './pathComponents';

export class NamingChangesRuleset extends Ruleset<Rule[]> {
  constructor(config: {
    applies: typeof appliesWhen[number];
    options?: NamingConfig;
    matches?: Ruleset['matches'];
  }) {
    if (!config) {
      // TODO silence this from sentry
      throw new Error('Expected config object in NamingChangesRuleset');
    }

    const { applies, matches, options = {} } = config;
    if (!applies || !appliesWhen.includes(applies)) {
      // TODO silence this from sentry
      throw new Error(
        `Expected config.applies in NamingChangesRuleset to be specified and be one of ${appliesWhen.join(
          ', '
        )}`
      );
    }
    if (Object.keys(options).length === 0) {
      // TODO silence this from sentry
      throw new Error(
        `Expected config.options in NamingChangesRuleset to have at least one value specified`
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
        ...createPropertyNamingChecks(applies, options.properties)
      );
    }
    if (options.queryParameters) {
      namingChangeRules.push(
        createQueryParameterChecks(applies, options.queryParameters)
      );
    }
    if (options.requestHeaders) {
      namingChangeRules.push(
        createRequestHeaderParameterChecks(applies, options.requestHeaders)
      );
    }
    if (options.cookieParameters) {
      namingChangeRules.push(
        createCookieParameterChecks(applies, options.cookieParameters)
      );
    }
    if (options.responseHeaders) {
      namingChangeRules.push(
        createResponseHeaderParameterChecks(applies, options.responseHeaders)
      );
    }
    if (options.pathComponents) {
      namingChangeRules.push(
        createPathComponentChecks(applies, options.pathComponents)
      );
    }

    super({
      name: 'Naming changes ruleset',
      matches,
      rules: namingChangeRules,
    });
  }
}
