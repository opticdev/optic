import { Static, Type } from '@sinclair/typebox';

import { NameMustBe } from '@useoptic/api-checks/build/rulesets/naming/helpers/config';
import { RuleApplies } from '@useoptic/api-checks/build/rulesets/shared-config';
import {
  ApiCheckService,
  makeApiChecksForStandards,
  OpenAPIV3,
} from '@useoptic/api-checks';
import Ajv from 'ajv/dist/2019';
import betterAjvErrors from 'better-ajv-errors';

const CaseKeys = Type.KeyOf(
  Type.Object({
    none: Type.String(),
    snake_case: Type.String(),
    camelCase: Type.String(),
    'param-case': Type.String(),
    PascalCase: Type.String(),
  })
);
const ApplyWhenKeys = Type.KeyOf(
  Type.Object({
    always: Type.String(),
    whenAdded: Type.String(),
    whenAddedOrChanged: Type.String(),
  })
);

const NamingRulesSchema = Type.Object(
  {
    requestHeaders: Type.Optional(CaseKeys),
    responseHeaders: Type.Optional(CaseKeys),
    requestProperties: Type.Optional(CaseKeys),
    responseProperties: Type.Optional(CaseKeys),
    queryParameters: Type.Optional(CaseKeys),
    applyNamingRules: Type.Optional(ApplyWhenKeys),
  },
  { additionalProperties: false }
);

type NamingRulesForExtension = Static<typeof NamingRulesSchema>;

export function parseConfig(openApi: OpenAPIV3.Document): ApiCheckService<any> {
  const config = openApi['x-optic-naming-checks'] as
    | NamingRulesForExtension
    | undefined;

  if (config) {
    const ajv = new Ajv({ strict: false });
    const valid = ajv.validate(NamingRulesSchema, config);

    if (!valid) {
      console.log(
        betterAjvErrors(NamingRulesSchema, config, ajv.errors!, {
          format: 'cli',
        })
      );
      console.log('read config docs here: ');
      throw new Error('invalid check configuration. exiting...');
    } else {
      return makeApiChecksForStandards({
        naming: {
          requestHeaders: config.requestHeaders && {
            applies:
              (config.applyNamingRules as RuleApplies) ||
              RuleApplies.whenAddedOrChanged,
            rule: config.requestHeaders as NameMustBe,
          },
          responseHeaders: config.responseHeaders && {
            applies:
              (config.applyNamingRules as RuleApplies) ||
              RuleApplies.whenAddedOrChanged,
            rule: config.responseHeaders as NameMustBe,
          },
          queryParameters: config.queryParameters && {
            applies:
              (config.applyNamingRules as RuleApplies) ||
              RuleApplies.whenAddedOrChanged,
            rule: config.queryParameters as NameMustBe,
          },
          requestProperties: config.requestProperties && {
            applies:
              (config.applyNamingRules as RuleApplies) ||
              RuleApplies.whenAddedOrChanged,
            rule: config.requestProperties as NameMustBe,
          },
          responseProperties: config.responseProperties && {
            applies:
              (config.applyNamingRules as RuleApplies) ||
              RuleApplies.whenAddedOrChanged,
            rule: config.responseProperties as NameMustBe,
          },
        },
        breakingChanges: { failOn: 'all' },
      });
    }
  } else {
    console.log(
      'using default ruleset. customize with the "x-optic-naming-checks" extension\nread docs here: '
    );

    return makeApiChecksForStandards({
      naming: {},
      breakingChanges: { failOn: 'all' },
    });
  }
}
