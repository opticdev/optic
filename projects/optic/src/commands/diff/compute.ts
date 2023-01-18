import {
  groupDiffsByEndpoint,
  compareSpecs,
} from '@useoptic/openapi-utilities';
import { generateRuleRunner } from './generate-rule-runner';
import { OPTIC_STANDARD_KEY } from '../../constants';
import { ParseResult } from '../../utils/spec-loaders';
import { OpticCliConfig } from '../../config';
import { trackEvent } from '@useoptic/openapi-utilities/build/utilities/segment';
import { getAnonId } from '../../utils/anonymous-id';

export async function compute(
  [baseFile, headFile]: [ParseResult, ParseResult],
  config: OpticCliConfig,
  options: {
    ruleset?: string;
    check: boolean;
  }
) {
  const { runner, ruleNames } = await generateRuleRunner(
    {
      rulesetArg: options.ruleset,
      specRuleset: headFile.isEmptySpec
        ? baseFile.jsonLike[OPTIC_STANDARD_KEY]
        : headFile.jsonLike[OPTIC_STANDARD_KEY],
      config,
    },
    options.check
  );

  trackEvent('diff.rulesets', await getAnonId(), {
    ruleset: ruleNames,
  });

  const specResults = await compareSpecs(baseFile, headFile, runner);

  const changelogData = groupDiffsByEndpoint(
    {
      from: baseFile.jsonLike,
      to: headFile.jsonLike,
    },
    specResults.diffs
  );

  return {
    specResults,
    changelogData,
    checks: {
      total: specResults.results.length,
      passed: specResults.results.filter((check) => check.passed).length,
      failed: specResults.results.filter(
        (check) => !check.passed && !check.exempted
      ).length,
    },
  };
}
