import { SpecFromInput } from '../utils/compare-input-parser';
import { specFromInputToResults, ParseResult } from '../utils/load-spec';
import {
  GetSessionResponse,
  OpticBackendClient,
  UploadSlot,
} from '../../clients/optic-client';
import { uploadFileToS3 } from '../utils/s3';
import { waitForSession } from './wait-for-session';
import { NormalizedCiContext } from '@useoptic/openapi-utilities';
import Bottleneck from 'bottleneck';

export type SpecInput = {
  from: SpecFromInput;
  to: SpecFromInput;
  id: string;
  path: string;
};

const NEEDED_SLOTS = [
  UploadSlot.FromFile,
  UploadSlot.ToFile,
  UploadSlot.FromSourceMap,
  UploadSlot.ToSourceMap,
];

// 5 minutes
const RUN_TIMEOUT = 1000 * 60 * 5;
const MAX_CONCURRENT = 5;

export async function initRun(
  client: OpticBackendClient,
  specs: SpecInput[],
  baseBranch: string,
  context: NormalizedCiContext
): Promise<GetSessionResponse[]> {
  const limiter = new Bottleneck({ maxConcurrent: MAX_CONCURRENT });
  const runner = (spec: SpecInput) =>
    runSingle(client, spec, baseBranch, context);
  const wrapped = limiter.wrap(runner);
  const runPromises = specs.map((spec) => wrapped(spec));
  return await Promise.all(runPromises);
}

async function runSingle(
  client: OpticBackendClient,
  specInput: SpecInput,
  baseBranch: string,
  context: NormalizedCiContext
): Promise<GetSessionResponse> {
  console.log(`Running comparison for ${specInput.path} against ${baseBranch}`);
  const [fromResults, toResults] = await Promise.all([
    specFromInputToResults(specInput.from),
    specFromInputToResults(specInput.to),
  ]);

  const sessionId = await client.createSession({
    owner: context.organization,
    repo: context.repo,
    commit_hash: context.commit_hash,
    pull_request: context.pull_request,
    run: context.run,
    branch_name: context.branch_name,
    from_arg: `${baseBranch}:${specInput.path}`,
    to_arg: specInput.path,
    status: 'started',
    spec_id: specInput.id,
  });
  console.log(
    `Uploading input files for ${specInput.path} against ${baseBranch}`
  );
  await upload(client, sessionId, fromResults, toResults);
  console.log(
    `Finished uploading input files for ${specInput.path} against ${baseBranch}`
  );
  await client.startSession(sessionId);

  console.log(
    `Generating results for ${specInput.path} against ${baseBranch}...`
  );
  // loop and wait for session to complete
  await waitForSession(client, sessionId, RUN_TIMEOUT);
  return client.getSession(sessionId);
}

async function upload(
  client: OpticBackendClient,
  sessionId: string,
  fromResults: ParseResult,
  toResults: ParseResult
) {
  const urls = await client.getUploadUrls(sessionId, NEEDED_SLOTS);

  const bufSources = [
    fromResults.jsonLike,
    toResults.jsonLike,
    fromResults.sourcemap,
    toResults.sourcemap,
  ];
  const uploadPromises = NEEDED_SLOTS.map((_, i) =>
    uploadFileToS3(urls[i].url, Buffer.from(JSON.stringify(bufSources[i])))
  );

  await Promise.all(uploadPromises);

  const markCompletePromises = urls.map((url) =>
    client.markUploadAsComplete(sessionId, url.id)
  );

  await Promise.all(markCompletePromises);
}
