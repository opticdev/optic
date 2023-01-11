import {
  generateChangelogData,
  generateSpecResults,
} from '@useoptic/openapi-utilities';
import { generateRuleRunner } from './generate-rule-runner';
import { OPTIC_STANDARD_KEY } from '../../constants';
import { ParseResult } from '../../utils/spec-loaders';
import { OpticCliConfig } from '../../config';

export async function compute(
  [baseFile, headFile]: [ParseResult, ParseResult],
  config: OpticCliConfig,
  options: {
    ruleset?: string;
    check: boolean;
  }
) {
  const ruleRunner = await generateRuleRunner(
    {
      rulesetArg: options.ruleset,
      specRuleset: headFile.isEmptySpec
        ? baseFile.jsonLike[OPTIC_STANDARD_KEY]
        : headFile.jsonLike[OPTIC_STANDARD_KEY],
      config,
    },
    options.check
  );
  const specResults = await generateSpecResults(
    ruleRunner,
    baseFile,
    headFile,
    null
  );

  const changelogData = generateChangelogData({
    changes: specResults.changes,
    toFile: headFile.jsonLike,
    rules: specResults.results,
  });

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
