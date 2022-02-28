import {
  defaultEmptySpec,
  validateOpenApiV3Document,
} from '@useoptic/openapi-utilities';
import { OpticBackendClient, UploadSlot } from './optic-client';
import { uploadFileToS3 } from './s3';
import { parseSpecVersion } from './compare-input-parser';
import {
  readAndValidateGithubContext,
  readAndValidateCircleCiContext,
} from './ci-context-parsers';
import { specFromInputToResults } from './load-spec';
import { UserError } from '../../errors';
import { CliConfig, NormalizedCiContext } from '../../types';

export const validateUploadRequirements = (
  uploadResults: boolean,
  cliConfig: CliConfig,
  ciContext?: string
) => {
  const supportedGitProviders = ['github'];
  const supportedCiProviders = ['github', 'circleci'];
  if (uploadResults) {
    // If uploadResults, we should have a valid optic token, git provider and ciContext
    if (!cliConfig.opticToken) {
      throw new UserError(
        'Expected an opticToken to be set in cliOptions when used with --upload-results - check usage of makeCiCli or makeCiCliWithNamedRules'
      );
    }

    if (!cliConfig.ciProvider) {
      throw new UserError(
        'Expected an ciProvider to be set in cliOptions when used with --upload-results - check usage of makeCiCli or makeCiCliWithNamedRules'
      );
    }

    if (!supportedCiProviders.includes(cliConfig.ciProvider)) {
      throw new UserError(
        `Unsupported gitProvider supplied - currently supported git providers are: ${supportedCiProviders.join(
          ', '
        )}`
      );
    }

    if (!cliConfig.gitProvider) {
      throw new UserError(
        'Expected an gitProvider to be set in cliOptions when used with --upload-results - check usage of makeCiCli or makeCiCliWithNamedRules'
      );
    }

    if (!supportedGitProviders.includes(cliConfig.gitProvider.provider)) {
      throw new UserError(
        `Unsupported gitProvider supplied - currently supported git providers are: ${supportedGitProviders.join(
          ', '
        )}`
      );
    }
    if (!cliConfig.gitProvider.token) {
      throw new UserError(`No gitProvider.token was supplied`);
    }

    if (!ciContext) {
      throw new UserError(
        'Expected --ci-context to be set when used with --upload-results'
      );
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
  const sessionId = await opticClient.startSession({
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

export const normalizeCiContext = (
  provider: 'github' | 'circleci',
  contextBuffer: Buffer
): NormalizedCiContext => {
  if (provider === 'github') {
    return readAndValidateGithubContext(contextBuffer);
  } else {
    return readAndValidateCircleCiContext(contextBuffer);
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
