import {
  OpenAPIV3,
  ApiCheckDsl,
  Result,
  Passed,
  Failed,
  EntityRule,
  ResultWithSourcemap,
  DocsLinkHelper,
} from '@useoptic/openapi-utilities';
import { parseSpecVersion } from './ci-cli/commands/utils';
import { specFromInputToResults } from './ci-cli/commands/utils';
import { makeCiCli, makeCiCliWithNamedRules } from './ci-cli/make-cli';

// TODO RA-V2 - deprecate old exports - start
import { ApiCheckService, DslConstructorInput } from './sdk/api-check-service';
import { createTestDslFixture } from './sdk/test-rule-fixture';
import { createSelectJsonPathHelper } from './sdk/select-when-rule';
import { genericEntityRuleImpl } from './sdk/generic-entity-rule-impl';
import { SpectralDsl } from './sdk/spectral/dsl';
import { ApiChangeDsl, ApiCheckDslContext } from './sdk/api-change-dsl';
import { runCheck, newDocsLinkHelper } from './utils';
import {
  disableRules,
  mergeRulesets,
  OpticCINamedRulesets,
  OpticCIRuleset,
} from './sdk/ruleset';
import {
  packagedRules,
  StandardApiChecks,
  makeApiChecksForStandards,
  standards,
} from './rulesets/packaged-rules';
import { check } from './sdk/define-check-test-dsl/define-check';
// TODO RA-V2 - deprecate old exports - end

export {
  ApiCheckService,
  newDocsLinkHelper,
  genericEntityRuleImpl,
  runCheck,
  makeCiCli,
  makeCiCliWithNamedRules,
  createTestDslFixture,
  OpenAPIV3,
  parseSpecVersion,
  createSelectJsonPathHelper,
  specFromInputToResults,
  SpectralDsl,
  ApiChangeDsl,
  mergeRulesets,
  disableRules,
  check,
  packagedRules as rulesets,
  standards,
  makeApiChecksForStandards,
};

export type {
  DslConstructorInput,
  DocsLinkHelper,
  ApiCheckDsl,
  Result,
  Passed,
  Failed,
  EntityRule,
  ApiCheckDslContext,
  OpticCIRuleset,
  OpticCINamedRulesets,
  ResultWithSourcemap,
  StandardApiChecks,
};
