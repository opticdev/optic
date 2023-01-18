import fs from 'node:fs/promises';
import path from 'path';
import {
  compareSpecs,
  RuleResult,
  groupDiffsByEndpoint,
} from '@useoptic/openapi-utilities';

type Comparison = {
  groupedDiffs: ReturnType<typeof groupDiffsByEndpoint>;
  results: Awaited<ReturnType<typeof compareSpecs>>['results'];
};

export type CiRunDetails = {
  completed: {
    warnings: string[];
    apiName: string;
    opticWebUrl: string;
    comparison: Comparison;
  }[];
  failed: { apiName: string; error: string }[];
  noop: { apiName: string }[];
};

const CI_DETAILS_FILE_PATH = path.join(process.cwd(), 'ci-run-details.json');

export async function writeDataForCi(
  specs: (
    | {
        warnings: string[];
        results: RuleResult[];
        groupedDiffs: ReturnType<typeof groupDiffsByEndpoint>;
        url: string;
        name: string;
      }
    | {
        name: string;
        error: string;
      }
  )[]
) {
  const data: CiRunDetails = {
    completed: [],
    failed: [],
    noop: [],
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
        spec.groupedDiffs.specification.length === 0 &&
        spec.results.length === 0
      ) {
        data.noop.push({
          apiName: spec.name,
        });
      } else {
        data.completed.push({
          apiName: spec.name,
          warnings: spec.warnings,
          opticWebUrl: spec.url,
          comparison: {
            groupedDiffs: spec.groupedDiffs,
            results: spec.results,
          },
        });
      }
    }
  }

  await fs.writeFile(CI_DETAILS_FILE_PATH, JSON.stringify(data), 'utf-8');
}

export async function readDataForCi(): Promise<CiRunDetails> {
  const file = await fs.readFile(CI_DETAILS_FILE_PATH, 'utf-8');

  return JSON.parse(file);
}
