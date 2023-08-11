import fs from 'node:fs/promises';
import path from 'path';
import {
  compareSpecs,
  RuleResult,
  groupDiffsByEndpoint,
  Severity,
} from '@useoptic/openapi-utilities';

type Comparison = {
  groupedDiffs: ReturnType<typeof groupDiffsByEndpoint>;
  results: Awaited<ReturnType<typeof compareSpecs>>['results'];
};

export type CiRunDetails = {
  completed: {
    warnings: string[];
    apiName: string;
    opticWebUrl?: string | null;
    comparison: Comparison;
    specUrl?: string | null;
  }[];
  failed: { apiName: string; error: string }[];
  noop: { apiName: string }[];
  severity: Severity;
};

const CI_DETAILS_FILE_PATH = path.join(process.cwd(), 'ci-run-details.json');

export async function getDataForCi(
  specs: (
    | {
        warnings: string[];
        results: RuleResult[];
        groupedDiffs: ReturnType<typeof groupDiffsByEndpoint>;
        changelogUrl?: string | null;
        specUrl?: string | null;
        name: string;
      }
    | {
        name: string;
        error: string;
      }
  )[],
  options: {
    severity: Severity;
  }
) {
  const data: CiRunDetails = {
    completed: [],
    failed: [],
    noop: [],
    severity: options.severity,
  };

  for (const spec of specs) {
    if ('error' in spec) {
      data.failed.push({
        apiName: spec.name,
        error: spec.error,
      });
    } else {
      if (
        Object.keys(spec.groupedDiffs.endpoints).length === 0 &&
        spec.groupedDiffs.specification.diffs.length === 0 &&
        spec.results.length === 0
      ) {
        data.noop.push({
          apiName: spec.name,
        });
      } else {
        data.completed.push({
          apiName: spec.name,
          warnings: spec.warnings,
          opticWebUrl: spec.changelogUrl,
          specUrl: spec.specUrl,
          comparison: {
            groupedDiffs: spec.groupedDiffs,
            results: spec.results,
          },
        });
      }
    }
  }
  return data;
}

export async function writeDataForCi(
  specs: (
    | {
        warnings: string[];
        results: RuleResult[];
        groupedDiffs: ReturnType<typeof groupDiffsByEndpoint>;
        changelogUrl?: string | null;
        specUrl?: string | null;
        name: string;
      }
    | {
        name: string;
        error: string;
      }
  )[],
  options: {
    severity: Severity;
  }
) {
  const data = await getDataForCi(specs, options);
  await fs.writeFile(CI_DETAILS_FILE_PATH, JSON.stringify(data), 'utf-8');
}

export async function readDataForCi(): Promise<CiRunDetails> {
  const file = await fs.readFile(CI_DETAILS_FILE_PATH, 'utf-8');

  return JSON.parse(file);
}
