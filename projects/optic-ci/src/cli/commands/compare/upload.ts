import {
  OpticBackendClient,
  LegacyUploadSlot,
} from '../../clients/optic-client';
import { CiRunArgs, uploadRun } from '../utils/shared-upload';
import {
  OpenAPIV3,
  CompareFileJson,
  NormalizedCiContext,
  UploadJson,
} from '@useoptic/openapi-utilities';

export const uploadCiRun = async (
  // CompareFileJson should be the same as CompareJson - this is read from the FE so we need to keep this stable
  compareOutput: CompareFileJson,
  fromFile: OpenAPIV3.Document,
  toFile: OpenAPIV3.Document,
  opticClient: OpticBackendClient,
  runArgs: CiRunArgs,
  normalizedCiContext: NormalizedCiContext
): Promise<UploadJson> => {
  const fileMap: Record<LegacyUploadSlot, Buffer> = {
    [LegacyUploadSlot.CheckResults]: Buffer.from(JSON.stringify(compareOutput)),
    [LegacyUploadSlot.FromFile]: Buffer.from(JSON.stringify(fromFile)),
    [LegacyUploadSlot.ToFile]: Buffer.from(JSON.stringify(toFile)),
  };

  const { web_url: opticWebUrl } = await uploadRun(
    opticClient,
    fileMap,
    runArgs,
    normalizedCiContext
  );
  const fileOutput: UploadJson = {
    opticWebUrl,
    ciContext: normalizedCiContext,
  };

  return fileOutput;
};
