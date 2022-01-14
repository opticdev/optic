import { Command, Option } from 'commander';
import {
  BulkCompareFileJson,
  CompareFileJson,
  BulkUploadFileJson,
} from '@useoptic/openapi-utilities';
import { OpticBackendClient, UploadSlot } from './optic-client';
import { loadFile, writeFile } from '../../utils';
import { wrapActionHandlerWithSentry } from '../../../sentry';
import { DEFAULT_BULK_UPLOAD_OUTPUT_FILENAME } from '../../../constants';
import {
  loadAndValidateSpecFiles,
  normalizeCiContext,
  uploadRun,
} from './shared-upload';

type RunArgs = {
  bulkCompare: string;
  provider: 'github' | 'circleci';
  ciContext: string;
};

export const registerBulkUpload = (
  cli: Command,
  { opticToken }: { opticToken?: string }
) => {
  cli
    .command('bulk-upload')
    .requiredOption(
      '--bulk-compare <bulkCompare>',
      'path to bulk compare output'
    )
    .addOption(
      new Option(
        '--provider <provider>',
        'The name of the ci-provider, supported'
      )
        .choices(['github', 'circleci'])
        .makeOptionMandatory()
    )
    .requiredOption('--ci-context <ciContext>', 'file with github context')
    .action(
      wrapActionHandlerWithSentry(async (runArgs: RunArgs) => {
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
        await bulkUploadCiRun(opticClient, runArgs);
      })
    );
};

const bulkUploadCiRun = async (
  opticClient: OpticBackendClient,
  runArgs: RunArgs
) => {
  console.log('Loading comparison files');
  const [bulkFileBuffer, contextFileBuffer] = await Promise.all([
    loadFile(runArgs.bulkCompare),
    loadFile(runArgs.ciContext),
  ]);
  const normalizedCiContext = normalizeCiContext(
    runArgs.provider,
    contextFileBuffer
  );

  const { comparisons }: BulkCompareFileJson = JSON.parse(
    bulkFileBuffer.toString()
  );

  const filteredComparisons = comparisons.filter(
    (comparison) => comparison.changes.length > 0
  );
  if (filteredComparisons.length === 0) {
    console.log(
      'None of the comparisons had any changes, not uploading anything.'
    );
    const fileOutput: BulkUploadFileJson = {
      comparisons: [],
      ciContext: normalizedCiContext,
    };
    // We write a file here which will propagate to bulk-comment and noop
    await writeFile(
      DEFAULT_BULK_UPLOAD_OUTPUT_FILENAME, // TODO maybe make this a cli argument?
      Buffer.from(JSON.stringify(fileOutput))
    );

    return;
  }
  console.log(
    `Uploading comparisons (${filteredComparisons.length}/${comparisons.length} comparisons had at least 1 change)`
  );

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
    };
    const fileMap: Record<UploadSlot, Buffer> = {
      [UploadSlot.CheckResults]: Buffer.from(JSON.stringify(checkResults)),
      [UploadSlot.FromFile]: fromFileS3Buffer,
      [UploadSlot.ToFile]: toFileS3Buffer,
      [UploadSlot.GithubActionsEvent]: contextFileBuffer,
      [UploadSlot.CircleCiEvent]: contextFileBuffer,
    };
    const { web_url: opticWebUrl } = await uploadRun(
      opticClient,
      fileMap,
      {
        provider: runArgs.provider,
        ciContext: runArgs.ciContext,
        compare: 'from bulk upload',
        from: comparison.inputs.from,
        to: comparison.inputs.to,
      },
      normalizedCiContext
    );
    uploadedComparisons.push({
      ...comparison,
      opticWebUrl,
    });
    console.log(
      `successfully uploaded ${JSON.stringify(
        comparison.inputs
      )} to ${opticWebUrl}`
    );
  }

  const fileOutput: BulkUploadFileJson = {
    comparisons: uploadedComparisons,
    ciContext: normalizedCiContext,
  };
  const uploadFileLocation = await writeFile(
    DEFAULT_BULK_UPLOAD_OUTPUT_FILENAME, // TODO maybe make this a cli argument?
    Buffer.from(JSON.stringify(fileOutput))
  );

  console.log('Successfully uploaded all files to Optic');
  console.log(`Results of this run can be found at ${uploadFileLocation}`);
};
