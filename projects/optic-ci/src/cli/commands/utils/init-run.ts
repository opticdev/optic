import { SpecFromInput } from './compare-input-parser';
import { specFromInputToResults } from './load-spec';
import { OpticBackendClient } from '../../clients/optic-client';

export async function initRun(
  client: OpticBackendClient,
  fromSpec: SpecFromInput,
  toSpec: SpecFromInput
): Promise<string> {
  const [fromResults, toResults] = await Promise.all([
    specFromInputToResults(fromSpec),
    specFromInputToResults(toSpec),
  ]);

  return 'whatever';
}
