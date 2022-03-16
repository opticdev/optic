import path from 'path';
import { OpticBackendClient, UploadSlot } from '../utils/optic-client';
import { loadFile } from '../utils';

import {
  CiRunArgs,
  uploadRun,
  normalizeCiContext,
} from '../utils/shared-upload';
import { NormalizedCiContext, UploadJson } from '../../types';
import { UserError } from '../../errors';
import { OpenAPIV3, CompareFileJson } from '@useoptic/openapi-utilities';
import { DEFAULT_CONTEXT_PATH } from '../constants';

export const uploadCiRun = async (
  // CompareFileJson should be the same as CompareJson - this is read from the FE so we need to keep this stable
  compareOutput: CompareFileJson,
  fromFile: OpenAPIV3.Document,
  toFile: OpenAPIV3.Document,
  ciProvider: 'github' | 'circleci',
  opticClient: OpticBackendClient,
  runArgs: CiRunArgs,
  ciContext?: string
): Promise<UploadJson> => {
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
