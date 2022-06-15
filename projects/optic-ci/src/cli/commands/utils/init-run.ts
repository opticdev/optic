import { SpecFromInput } from './compare-input-parser';
import { specFromInputToResults } from './load-spec';
import { OpticBackendClient } from '../../clients/optic-client';

export type SpecInput = {
  from: SpecFromInput;
  to: SpecFromInput;
  id: string;
};

export async function initRun(
  client: OpticBackendClient,
  specs: SpecInput[]
): Promise<string> {
  const [fromResults, toResults] = await Promise.all([
    specFromInputToResults(fromSpec),
    specFromInputToResults(toSpec),
  ]);

  return 'whatever';
}
