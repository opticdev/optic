import {
  defaultEmptySpec,
  NormalizedCiContext,
  UserError,
} from '@useoptic/openapi-utilities';
import {
  LegacyUploadSlot,
  OpticBackendClient,
  UploadSlot,
} from '../../clients/optic-client';
import { uploadFileToS3 } from './s3';
import { parseSpecVersion } from './compare-input-parser';
import {
  readAndValidateGithubContext,
  readAndValidateCircleCiContext,
} from './ci-context-parsers';
import { specFromInputToResults } from './load-spec';
import { CliConfig } from '../../types';
import { SUPPORTED_GITHUB_CI_PROVIDERS } from '../constants';
import { validateOpenApiV3Document } from '@useoptic/openapi-io';

export const validateUploadRequirements = (
  uploadResults: boolean,
  cliConfig: CliConfig
) => {
  if (uploadResults) {
    // If uploadResults, we should have a valid optic token, git provider and ciContext
    if (!cliConfig.opticToken) {
      throw new UserError({
        message:
          'Expected an opticToken to be set in cliOptions when used with --upload-results - check optic.config.js file',
      });
    }

    if (!cliConfig.ciProvider) {
      throw new UserError({
        message:
          'Expected an ciProvider to be set in cliOptions when used with --upload-results - check optic.config.js file',
      });
    }

    if (!SUPPORTED_GITHUB_CI_PROVIDERS.includes(cliConfig.ciProvider)) {
      throw new UserError({
        message: `Unsupported gitProvider supplied - currently supported git providers are: ${SUPPORTED_GITHUB_CI_PROVIDERS.join(
          ', '
        )}`,
      });
    }

    if (!cliConfig.gitProvider) {
      throw new UserError({
        message:
          'Expected an gitProvider to be set in cliOptions when used with --upload-results - check optic.config.js file',
      });
    }
    if (!cliConfig.gitProvider.token) {
      throw new UserError({ message: `No gitProvider.token was supplied` });
    }
  }
};

export type CiRunArgs = {
  from?: string;
  to?: string;
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
  ciContext: NormalizedCiContext
): Promise<string> => {
  const sessionId = await opticClient.createSession({
    owner: ciContext.organization,
    repo: ciContext.repo,
    commit_hash: ciContext.commit_hash,
    run: ciContext.run,
    pull_request: ciContext.pull_request,
    branch_name: ciContext.branch_name,
    from_arg: runArgs.from || '',
    to_arg: runArgs.to || '',
  });

  return sessionId;
};

// https://github.com/opticdev/issues/issues/236 - to deprecate
export const normalizeCiContext = (
  provider: 'github' | 'circleci',
  contextBuffer: Buffer
): NormalizedCiContext => {
  if (provider === 'github') {
    return { ...readAndValidateGithubContext(contextBuffer), user: null };
  } else {
    return { ...readAndValidateCircleCiContext(contextBuffer), user: null };
  }
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
    throw new UserError({ message: (e as Error).message });
  }

  return {
    fromFileS3Buffer,
    toFileS3Buffer,
  };
};

export const uploadRun = async (
  opticClient: OpticBackendClient,
  fileMap: Record<LegacyUploadSlot, Buffer>,
  runArgs: CiRunArgs,
  ciContext: NormalizedCiContext
) => {
  const sessionId = await startSession(opticClient, runArgs, ciContext);

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

  await Promise.all(
    uploadedFilePaths.map(async (uploadedFilePath) =>
      opticClient.markUploadAsComplete(sessionId, uploadedFilePath.id)
    )
  );

  return opticClient.getSession(sessionId);
};
