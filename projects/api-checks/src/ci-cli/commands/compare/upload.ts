import { OpticBackendClient, UploadSlot } from '../utils/optic-client';
import { loadFile } from '../utils';

import {
  CiRunArgs,
  uploadRun,
  normalizeCiContext,
} from '../utils/shared-upload';
import { CompareJson, UploadJson } from '../../types';
import { OpenAPIV3, CompareFileJson } from '@useoptic/openapi-utilities';

export const uploadCiRun = async (
  // CompareFileJson should be the same as CompareJson - this is read from the FE so we need to keep this stable
  compareOutput: CompareFileJson,
  fromFile: OpenAPIV3.Document,
  toFile: OpenAPIV3.Document,
  ciContext: string,
  ciProvider: 'github' | 'circleci',
  opticClient: OpticBackendClient,
  runArgs: CiRunArgs // TODO remove this from backend web and from here
): Promise<UploadJson> => {
  const contextFileBuffer = await loadFile(ciContext);

  const normalizedCiContext = normalizeCiContext(ciProvider, contextFileBuffer);

  const fileMap: Record<UploadSlot, Buffer> = {
    [UploadSlot.CheckResults]: Buffer.from(JSON.stringify(compareOutput)),
    [UploadSlot.FromFile]: Buffer.from(JSON.stringify(fromFile)),
    [UploadSlot.ToFile]: Buffer.from(JSON.stringify(toFile)),
    [UploadSlot.GithubActionsEvent]: contextFileBuffer,
    [UploadSlot.CircleCiEvent]: contextFileBuffer,
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
