import path from 'path';
import dotenv from 'dotenv';
import { expect } from 'chai';
import { ApiCheckService } from './sdk/api-check-service';
import { makeApiChecksForStandards } from './rulesets/packaged-rules';
import { ApiCheckDslContext } from './sdk/api-change-dsl';
import { makeCiCli } from './ci-cli/make-cli';
import { NameMustBe } from './rulesets/naming/helpers/config';
import { RuleApplies } from './rulesets/shared-config';

if (process.env.OPTIC_DEBUG_ENV_FILE) {
  console.log(`using overridden env ${process.env.OPTIC_DEBUG_ENV_FILE}`);
}
const envPath =
  process.env.OPTIC_DEBUG_ENV_FILE || path.join(__dirname, '..', '.env');

dotenv.config({
  path: envPath,
});

const checker: ApiCheckService<ApiCheckDslContext> = makeApiChecksForStandards({
  naming: {
    requestHeaders: {
      rule: NameMustBe.camelCase,
      applies: RuleApplies.always,
    },
    queryParameters: {
      rule: NameMustBe.camelCase,
      applies: RuleApplies.always,
    },
    requestProperties: {
      rule: NameMustBe.camelCase,
      applies: RuleApplies.always,
    },
    responseProperties: {
      rule: NameMustBe.camelCase,
      applies: RuleApplies.always,
    },
    responseHeaders: {
      rule: NameMustBe.camelCase,
      applies: RuleApplies.always,
    },
  },
  breakingChanges: {
    failOn: 'all',
  },
});

const cli = makeCiCli('play-thing', checker, {
  opticToken: process.env.OPTIC_TOKEN || '123',
  gitProvider: {
    token: process.env.GITHUB_TOKEN || '123',
    provider: 'github',
  },
  ciProvider: 'github',
});

cli.parse(process.argv);
