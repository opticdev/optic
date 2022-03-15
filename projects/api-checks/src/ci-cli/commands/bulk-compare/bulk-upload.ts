import path from 'path';
import { CompareFileJson } from '@useoptic/openapi-utilities';
import { OpticBackendClient, UploadSlot } from '../utils/optic-client';
import { loadFile } from '../utils';
import {
  loadAndValidateSpecFiles,
  normalizeCiContext,
  uploadRun,
} from '../utils/shared-upload';
import {
  BulkCompareJson,
  BulkUploadJson,
  NormalizedCiContext,
} from '../../types';
import { UserError } from '../../errors';
import { DEFAULT_CONTEXT_PATH } from '../constants';

export const bulkUploadCiRun = async (
  opticClient: OpticBackendClient,
  bulkCompareOutput: BulkCompareJson,
  ciProvider: 'github' | 'circleci',
  ciContext?: string
): Promise<BulkUploadJson | null> => {
  let normalizedCiContext: NormalizedCiContext;
  if (ciContext) {
    // Legacy flow
    // https://github.com/opticdev/issues/issues/236 - to deprecate
    try {
      const contextFileBuffer = await loadFile(ciContext);
      normalizedCiContext = normalizeCiContext(ciProvider, contextFileBuffer);
    } catch (e) {
      console.error(e);
      throw new UserError();
    }
  } else {
    console.log(
      `Attempting to read context from default context path ${path.join(
        process.cwd(),
        DEFAULT_CONTEXT_PATH
      )}`
    );
    // New flow - implicit assumption of using `optic-ci create-context`;
    // TODO also allow users to specify the paths - also requires validation
    try {
      const contextFileBuffer = await loadFile(DEFAULT_CONTEXT_PATH);
      normalizedCiContext = JSON.parse(contextFileBuffer.toString());
    } catch (e) {
      console.error(e);
      throw new UserError();
    }
  }

  const { comparisons } = bulkCompareOutput;

  const filteredComparisons = comparisons.filter(
    (comparison) => comparison.changes.length > 0
  );
  if (filteredComparisons.length === 0) {
    return null;
  }

  const uploadedComparisons = [];

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
    };
    const fileMap: Record<UploadSlot, Buffer> = {
      [UploadSlot.CheckResults]: Buffer.from(JSON.stringify(checkResults)),
      [UploadSlot.FromFile]: fromFileS3Buffer,
      [UploadSlot.ToFile]: toFileS3Buffer,
    };
    const { web_url: opticWebUrl } = await uploadRun(
      opticClient,
      fileMap,
      {
        from: comparison.inputs.from
          ? path.join(process.cwd(), comparison.inputs.from)
          : comparison.inputs.from,
        to: comparison.inputs.to
          ? path.join(process.cwd(), comparison.inputs.to)
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
