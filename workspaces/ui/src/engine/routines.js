import { RfcCommands } from '@useoptic/domain';

export function commandsForUpdatingContribution(id, key, value) {
  return [RfcCommands.AddContribution(id, key, value)];
}
