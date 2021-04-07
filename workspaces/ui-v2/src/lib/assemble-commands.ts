import { IPendingEndpoint } from '../optic-components/hooks/diffs/SharedDiffState';

export function AssembleCommands(
  approvedSuggestions: { [key: string]: any[] },
  pendingEndpoints: IPendingEndpoint[]
): any[] {
  const commands: any[] = [];

  Object.keys(approvedSuggestions)
    .sort()
    .forEach((key: string) => {
      commands.push(...approvedSuggestions[key]);
    });

  /// do something with pending endpoints

  return commands;
}
