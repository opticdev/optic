import { OpticBackendClient, UploadSlot } from '../../clients/optic-client';
import { CiRunArgs, uploadRun } from '../utils/shared-upload';
import { NormalizedCiContext, UploadJson } from '../../types';
import { OpenAPIV3, CompareFileJson } from '@useoptic/openapi-utilities';

export const uploadCiRun = async (
  // CompareFileJson should be the same as CompareJson - this is read from the FE so we need to keep this stable
  compareOutput: CompareFileJson,
  fromFile: OpenAPIV3.Document,
  toFile: OpenAPIV3.Document,
  opticClient: OpticBackendClient,
  runArgs: CiRunArgs,
  normalizedCiContext: NormalizedCiContext
): Promise<UploadJson> => {
  const fileMap: Record<UploadSlot, Buffer> = {
    [UploadSlot.CheckResults]: Buffer.from(JSON.stringify(compareOutput)),
    [UploadSlot.FromFile]: Buffer.from(JSON.stringify(fromFile)),
    [UploadSlot.ToFile]: Buffer.from(JSON.stringify(toFile)),
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
