import { Command, Option } from 'commander';
import { CompareFileJson, UploadFileJson } from '@useoptic/openapi-utilities';
import { OpticBackendClient, UploadSlot } from './optic-client';
import { loadFile, writeFile } from '../../utils';
import { wrapActionHandlerWithSentry } from '../../../sentry';
import { DEFAULT_UPLOAD_OUTPUT_FILENAME } from '../../../constants';
import {
  CiRunArgs,
  loadAndValidateSpecFiles,
  uploadRun,
  normalizeCiContext,
} from './shared-upload';

export const registerUpload = (
  cli: Command,
  { opticToken }: { opticToken?: string }
) => {
  cli
    .command('upload')
    .option('--from <from>', 'from file or rev:file')
    .requiredOption('--to <to>', 'to file or rev:file')
    .addOption(
      new Option(
        '--provider <provider>',
        'The name of the ci-provider, supported'
      )
        .choices(['github', 'circleci'])
        .makeOptionMandatory()
    )
    .requiredOption('--ci-context <ciContext>', 'file with github context')
    .requiredOption('--compare <compare>', 'path to compare output')
    .action(
      wrapActionHandlerWithSentry(async (runArgs: CiRunArgs) => {
        if (!opticToken) {
          console.error('Upload token was not included');
          return process.exit(1);
        }

        const backendWebBase =
          // TODO centralize this optic env configuration
          process.env.OPTIC_ENV === 'staging'
            ? 'https://api.o3c.info'
            : 'https://api.useoptic.com';

        const opticClient = new OpticBackendClient(backendWebBase, () =>
          Promise.resolve(opticToken)
        );
        await uploadCiRun(opticClient, runArgs);
      })
    );
};

export const uploadCiRun = async (
  opticClient: OpticBackendClient,
  runArgs: CiRunArgs
) => {
  console.log('Loading files...');
  const [
    contextFileBuffer,
    rulesFileS3Buffer,
    { fromFileS3Buffer, toFileS3Buffer },
  ] = await Promise.all([
    loadFile(runArgs.ciContext),
    loadFile(runArgs.compare),
    loadAndValidateSpecFiles(runArgs.from, runArgs.to),
  ]);
  const normalizedCiContext = normalizeCiContext(
    runArgs.provider,
    contextFileBuffer
  );

  const { results, changes }: CompareFileJson = JSON.parse(
    rulesFileS3Buffer.toString()
  );

  if (changes.length === 0) {
    console.log('No changes were detected, not uploading anything.');
    const fileOutput: UploadFileJson = {
      results,
      changes,
      opticWebUrl: '',
      ciContext: normalizedCiContext,
    };
    // We write a file here which will propagate to github-comment and noop
    await writeFile(
      DEFAULT_UPLOAD_OUTPUT_FILENAME, // TODO maybe make this a cli argument?
      Buffer.from(JSON.stringify(fileOutput))
    );

    return;
  }

  console.log('Uploading OpenAPI files to Optic...');

  const fileMap: Record<UploadSlot, Buffer> = {
    [UploadSlot.CheckResults]: rulesFileS3Buffer,
    [UploadSlot.FromFile]: fromFileS3Buffer,
    [UploadSlot.ToFile]: toFileS3Buffer,
    [UploadSlot.GithubActionsEvent]: contextFileBuffer,
    [UploadSlot.CircleCiEvent]: contextFileBuffer,
  };

  const { web_url: opticWebUrl } = await uploadRun(
    opticClient,
    fileMap,
    runArgs,
    normalizedCiContext
  );
  const fileOutput: UploadFileJson = {
    results,
    changes,
    opticWebUrl,
    ciContext: normalizedCiContext,
  };
  const uploadFileLocation = await writeFile(
    DEFAULT_UPLOAD_OUTPUT_FILENAME, // TODO maybe make this a cli argument?
    Buffer.from(JSON.stringify(fileOutput))
  );

  console.log('Successfully uploaded files to Optic');
  console.log(`You can view the results of this run at: ${opticWebUrl}`);
  console.log(`Results of this run can be found at ${uploadFileLocation}`);
};
