import {
  LegacyUploadSlot,
  OpticBackendClient,
} from '../../clients/optic-client';
import {
  CompareFileJson,
  BulkCompareJson,
  BulkUploadJson,
  NormalizedCiContext,
} from '@useoptic/openapi-utilities';
import { loadAndValidateSpecFiles, uploadRun } from '../utils/shared-upload';
import { inGit } from '../utils/git';
import { getRelativeRepoPath } from '../utils/path';

export const bulkUploadCiRun = async (
  opticClient: OpticBackendClient,
  bulkCompareOutput: BulkCompareJson,
  normalizedCiContext: NormalizedCiContext
): Promise<BulkUploadJson | null> => {
  const { comparisons } = bulkCompareOutput;

  const filteredComparisons = comparisons.filter(
    (comparison) => comparison.changes.length > 0
  );
  if (filteredComparisons.length === 0) {
    return null;
  }

  const uploadedComparisons: BulkUploadJson['comparisons'] = [];
  const gitRootPath = await inGit(process.cwd());

  // TODO make this run in parallel w/ bottleneck
  for (const comparison of filteredComparisons) {
    const { fromFileS3Buffer, toFileS3Buffer } = await loadAndValidateSpecFiles(
      comparison.inputs.from,
      comparison.inputs.to
    );
    const checkResults: CompareFileJson = {
      changes: comparison.changes,
      results: comparison.results,
      projectRootDir: comparison.projectRootDir,
      version: comparison.version,
    };
    const fileMap: Record<LegacyUploadSlot, Buffer> = {
      [LegacyUploadSlot.CheckResults]: Buffer.from(
        JSON.stringify(checkResults)
      ),
      [LegacyUploadSlot.FromFile]: fromFileS3Buffer,
      [LegacyUploadSlot.ToFile]: toFileS3Buffer,
    };
    const { web_url: opticWebUrl } = await uploadRun(
      opticClient,
      fileMap,
      {
        from: comparison.inputs.from
          ? getRelativeRepoPath(comparison.inputs.from, gitRootPath)
          : comparison.inputs.from,
        to: comparison.inputs.to
          ? getRelativeRepoPath(comparison.inputs.to, gitRootPath)
          : comparison.inputs.to,
      },
      normalizedCiContext
    );
    uploadedComparisons.push({
      ...comparison,
      opticWebUrl,
    });
  }

  return {
    comparisons: uploadedComparisons,
    ciContext: normalizedCiContext,
  };
};
