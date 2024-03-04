import {
  groupDiffsByEndpoint,
  compareSpecs,
  Severity,
  CompareSpecResults,
} from '@useoptic/openapi-utilities';
import { generateRuleRunner } from './generate-rule-runner';
import { OPTIC_STANDARD_KEY } from '../../constants';
import { ParseResult, parseOpticRef } from '../../utils/spec-loaders';
import { ConfigRuleset, OpticCliConfig } from '../../config';
import { trackEvent } from '../../segment';
import { logger } from '../../logger';
import { checkOpenAPIVersion } from '@useoptic/openapi-io';
import { GroupedDiffs } from '@useoptic/openapi-utilities/build/openapi3/group-diff';

let generateContext: (file: string) => any = () => ({});

export function setGenerateContext(fn: (file: string) => any) {
  generateContext = fn;
}

export async function compute(
  [baseFile, headFile]: [ParseResult, ParseResult],
  config: OpticCliConfig,
  options: {
    standard?: string;
    check: boolean;
    path: string | null;
  }
): Promise<{
  standard: ConfigRuleset[];
  warnings: string[];
  specResults: CompareSpecResults;
  changelogData: GroupedDiffs;
  checks: {
    total: number;
    passed: number;
    exempted: number;
    failed: {
      info: number;
      error: number;
      warn: number;
    };
  };
}> {
  if (baseFile.version === '2.x.x' || headFile.version === '2.x.x') {
    const warnings: string[] = [];
    if (baseFile.version === '2.x.x')
      warnings.push(
        `before file spec version 2.x.x. diffing and rule running is not supported yet`
      );
    if (headFile.version === '2.x.x')
      warnings.push(
        `after file spec version 2.x.x. diffing and rule running is not supported yet`
      );
    return {
      standard: [],
      warnings,
      specResults: { diffs: [], results: [], version: '' },
      changelogData: new GroupedDiffs(),
      checks: {
        total: 0,
        passed: 0,
        exempted: 0,
        failed: {
          info: 0,
          error: 0,
          warn: 0,
        },
      },
    };
  }

  const { runner, ruleNames, warnings, standard } = await generateRuleRunner(
    {
      rulesetArg: options.standard,
      specRuleset: headFile.isEmptySpec
        ? baseFile.jsonLike[OPTIC_STANDARD_KEY]
        : headFile.jsonLike[OPTIC_STANDARD_KEY],
      config,
      specVersion: headFile.isEmptySpec ? headFile.version : baseFile.version,
    },
    options.check
  );

  trackEvent('diff.rulesets', {
    ruleset: ruleNames,
  });

  let context = {};
  if (process.env.OPTIC_DIFF_CONTEXT) {
    try {
      context = JSON.parse(process.env.OPTIC_DIFF_CONTEXT);
    } catch (e) {
      logger.error('Error generating context');
      logger.error(e);
    }
  } else {
    const parsed = parseOpticRef(options.path);
    const filePath =
      parsed.from === 'git'
        ? parsed.name
        : parsed.from === 'file'
          ? parsed.filePath
          : null;
    if (filePath) {
      try {
        context = generateContext(filePath);
      } catch (e) {
        logger.error('Error generating context');
        logger.error(e);
      }
    }
  }
  const specResults = await compareSpecs(baseFile, headFile, runner, context);

  const changelogData = groupDiffsByEndpoint(
    {
      from: baseFile.jsonLike,
      to: headFile.jsonLike,
    },
    specResults.diffs,
    specResults.results
  );

  return {
    standard,
    warnings,
    specResults,
    changelogData,
    checks: {
      total: specResults.results.length,
      passed: specResults.results.filter((check) => check.passed).length,
      exempted: specResults.results.filter(
        (check) => !check.passed && check.exempted
      ).length,
      failed: {
        info: specResults.results.filter(
          (check) =>
            !check.passed && !check.exempted && check.severity === Severity.Info
        ).length,
        error: specResults.results.filter(
          (check) =>
            !check.passed &&
            !check.exempted &&
            check.severity === Severity.Error
        ).length,
        warn: specResults.results.filter(
          (check) =>
            !check.passed && !check.exempted && check.severity === Severity.Warn
        ).length,
      },
    },
  };
}
