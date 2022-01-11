import {
  defaultEmptySpec,
  validateOpenApiV3Document,
} from '@useoptic/openapi-utilities';
import { OpticBackendClient, SessionType, UploadSlot } from './optic-client';
import {
  uploadFileToS3,
  parseSpecVersion,
  readAndValidateGithubContext,
  readAndValidateCircleCiContext,
  specFromInputToResults,
} from '../utils';
import { UserError } from '../../errors';

export type CiRunArgs = {
  from?: string;
  provider: 'github' | 'circleci';
  to?: string;
  ciContext: string;
  compare: string;
};

const loadSpecFile = async (fileName: string): Promise<Buffer> => {
  const parsedOpenApifile = await specFromInputToResults(
    parseSpecVersion(fileName, defaultEmptySpec),
    process.cwd()
  );
  return Buffer.from(JSON.stringify(parsedOpenApifile.jsonLike));
};

const startSession = async (
  opticClient: OpticBackendClient,
  runArgs: CiRunArgs,
  contextBuffer: Buffer
): Promise<string> => {
  if (runArgs.provider === 'github') {
    const {
      organization,
      pull_request,
      run,
      commit_hash,
      repo,
    } = readAndValidateGithubContext(contextBuffer);

    const sessionId = await opticClient.startSession(
      SessionType.GithubActions,
      {
        run_args: {
          from: runArgs.from || '',
          to: runArgs.to || '',
          context: runArgs.ciContext,
          rules: runArgs.compare,
          provider: runArgs.provider,
        },
        github_data: {
          organization,
          repo,
          pull_request,
          run,
          commit_hash,
        },
      }
    );
    return sessionId;
  } else if (runArgs.provider === 'circleci') {
    const {
      organization,
      pull_request,
      run,
      commit_hash,
      repo,
    } = readAndValidateCircleCiContext(contextBuffer);

    const sessionId = await opticClient.startSession(SessionType.CircleCi, {
      run_args: {
        from: runArgs.from || '',
        to: runArgs.to || '',
        context: runArgs.ciContext,
        rules: runArgs.compare,
        provider: runArgs.provider,
      },
      circle_ci_data: {
        organization,
        repo,
        pull_request,
        run,
        commit_hash,
      },
    });
    return sessionId;
  }
  throw new Error(`Unrecognized provider ${runArgs.provider}`);
};

export const loadAndValidateSpecFiles = async (from?: string, to?: string) => {
  const [fromFileS3Buffer, toFileS3Buffer] = await Promise.all([
    from
      ? loadSpecFile(from)
      : Promise.resolve(Buffer.from(JSON.stringify(defaultEmptySpec))),
    to
      ? loadSpecFile(to)
      : Promise.resolve(Buffer.from(JSON.stringify(defaultEmptySpec))),
  ]);

  try {
    validateOpenApiV3Document(JSON.parse(fromFileS3Buffer.toString()));
    validateOpenApiV3Document(JSON.parse(toFileS3Buffer.toString()));
  } catch (e) {
    throw new UserError((e as Error).message);
  }

  return {
    fromFileS3Buffer,
    toFileS3Buffer,
  };
};

export const uploadRun = async (
  opticClient: OpticBackendClient,
  fileMap: Record<UploadSlot, Buffer>,
  runArgs: CiRunArgs
) => {
  const contextFileBuffer = fileMap.GithubActionsEvent; // This should be identical to the other context
  const sessionId = await startSession(opticClient, runArgs, contextFileBuffer);

  const uploadUrls = await opticClient.getUploadUrls(sessionId);

  const uploadedFilePaths: {
    id: string;
    slot: UploadSlot;
  }[] = await Promise.all(
    uploadUrls.map(async (uploadUrl) => {
      const file = fileMap[uploadUrl.slot];
      await uploadFileToS3(uploadUrl.url, file);

      return {
        id: uploadUrl.id,
        slot: uploadUrl.slot,
      };
    })
  );

  // TODO run this in parallel when optimistic concurrency is fixed
  // await Promise.all(
  //   uploadedFilePaths.map(async (uploadedFilePath) =>
  //     opticClient.markUploadAsComplete(
  //       sessionId,
  //       uploadedFilePath.id,
  //       uploadedFilePath.slot
  //     )
  //   )
  // );

  // Run this sequentially to work around optimistic concurrency bug
  await uploadedFilePaths.reduce(async (promiseChain, uploadedFilePath) => {
    await promiseChain;
    return opticClient.markUploadAsComplete(
      sessionId,
      uploadedFilePath.id,
      uploadedFilePath.slot
    );
  }, Promise.resolve());

  return opticClient.getSession(sessionId);
};
