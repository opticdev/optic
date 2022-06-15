import { SpecFromInput } from './compare-input-parser';
import { specFromInputToResults } from './load-spec';
import { OpticBackendClient, UploadSlot } from '../../clients/optic-client';

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

  const sessionId = await client.startSession({
    owner: '',
    repo: '',
    commit_hash: '',
    pull_request: 0,
    run: 0,
    branch_name: '',
    from_arg: '',
    to_arg: '',
  });

  const urls = await client.getUploadUrls(sessionId, NEEDED_SLOTS);

  return 'whatever';
}
