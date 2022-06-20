import { SpecFromInput } from '../utils/compare-input-parser';
import { specFromInputToResults, ParseResult } from '../utils/load-spec';
import {
  GetSessionResponse,
  OpticBackendClient,
  UploadSlot,
} from '../../clients/optic-client';
import { uploadFileToS3 } from '../utils/s3';
import { waitForSession } from './wait-for-session';

export type SpecInput = {
  from: SpecFromInput;
  to: SpecFromInput;
  id: string;
};

const NEEDED_SLOTS = [
  UploadSlot.FromFile,
  UploadSlot.ToFile,
  UploadSlot.FromSourceMap,
  UploadSlot.ToSourceMap,
];

// 5 minutes
const RUN_TIMEOUT = 1000 * 60 * 5;

// 5 seconds
const POLL_INTERVAL = 5000;

export async function initRun(
  client: OpticBackendClient,
  specs: SpecInput[]
): Promise<GetSessionResponse[]> {
  const runPromises = specs.map((spec) => runSingle(client, spec));

  return await Promise.all(runPromises);
}

async function runSingle(
  client: OpticBackendClient,
  specInput: SpecInput
): Promise<GetSessionResponse> {
  const [fromResults, toResults] = await Promise.all([
    specFromInputToResults(specInput.from),
    specFromInputToResults(specInput.to),
  ]);

  const sessionId = await client.createSession({
    owner: '',
    repo: '',
    commit_hash: '',
    pull_request: 0,
    run: 0,
    branch_name: '',
    from_arg: '',
    to_arg: '',
  });

  await upload(client, sessionId, fromResults, toResults);

  await client.startSession(sessionId);

  // loop and wait for session to complete
  return await waitForSession(client, sessionId, RUN_TIMEOUT, POLL_INTERVAL);
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
