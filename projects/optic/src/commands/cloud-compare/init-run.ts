import {
  GetSessionResponse,
  OpticBackendClient,
  UploadSlot,
} from '@useoptic/optic-ci/build/cli/clients/optic-client';
import { uploadFileToS3 } from '@useoptic/optic-ci/build/cli/commands/utils/s3';

import { waitForSession } from './wait-for-session';
import { NormalizedCiContext } from '@useoptic/openapi-utilities';
import Bottleneck from 'bottleneck';
import { logger } from '../../logger';
import { ParseResult } from '../../utils/spec-loaders';

export type SpecInput = {
  from: ParseResult;
  to: ParseResult;
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
  logger.debug(
    `Running comparison for ${specInput.path} against ${baseBranch}`
  );
  const fromResults = specInput.from;
  const toResults = specInput.to;

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
  logger.debug(
    `Uploading input files for ${specInput.path} against ${baseBranch}`
  );
  await upload(client, sessionId, fromResults, toResults);
  logger.debug(
    `Finished uploading input files for ${specInput.path} against ${baseBranch}`
  );
  await client.startSession(sessionId);

  logger.debug(
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
