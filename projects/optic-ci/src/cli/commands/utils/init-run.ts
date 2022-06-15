import { SpecFromInput } from './compare-input-parser';
import { specFromInputToResults } from './load-spec';
import {
  GetSessionResponse,
  OpticBackendClient,
  SessionStatus,
  UploadSlot,
} from '../../clients/optic-client';
import { uploadFileToS3 } from './s3';
import { ParseOpenAPIResult } from '@useoptic/openapi-io';

export type SpecInput = {
  from: SpecFromInput;
  to: SpecFromInput;
  id: string;
};

type ParseResult = ParseOpenAPIResult & { isEmptySpec: boolean };

const NEEDED_SLOTS = [
  UploadSlot.FromFile,
  UploadSlot.ToFile,
  UploadSlot.FromSourceMap,
  UploadSlot.ToSourceMap,
];

export async function initRun(
  client: OpticBackendClient,
  specs: SpecInput[]
): Promise<string[]> {
  const runPromises = specs.map((spec) => runSingle(client, spec));

  return await Promise.all(runPromises);
}

async function runSingle(
  client: OpticBackendClient,
  specInput: SpecInput
): Promise<string> {
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
  const result = await waitForSession(client, sessionId);
  console.log(result);

  return 'whatever';
}

async function upload(
  client: OpticBackendClient,
  sessionId: string,
  fromResults: ParseResult,
  toResults: ParseResult
) {
  const urls = await client.getUploadUrls(sessionId, NEEDED_SLOTS);

  const bufData = [
    fromResults.jsonLike,
    toResults.jsonLike,
    fromResults.sourcemap,
    toResults.sourcemap,
  ];
  const uploadPromises = NEEDED_SLOTS.map((_, i) =>
    uploadFileToS3(urls[i].url, Buffer.from(JSON.stringify(bufData[i])))
  );

  await Promise.all(uploadPromises);

  const markCompletePromises = urls.map((url) =>
    client.markUploadAsComplete(sessionId, url.id)
  );

  await Promise.all(markCompletePromises);
}

async function waitForSession(
  client: OpticBackendClient,
  sessionId: string
): Promise<GetSessionResponse> {
  // timeout in 5 minutes for now
  const timeout = new Date(new Date().getTime() + 1000 * 60 * 5);

  while (new Date() < timeout) {
    const session = await client.getSession(sessionId);
    if (session.status === SessionStatus.Ready) {
      return session;
    }

    await sleep(5000);
  }

  throw new Error('Timed out waiting for execution to complete');
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
