import { IPendingEndpoint } from '../optic-components/hooks/diffs/SharedDiffState';

export function AssembleCommands(
  approvedSuggestions: { [key: string]: any[] },
  pendingEndpoints: IPendingEndpoint[],
  existingEndpointNameContributions: { [id: string]: string }
): any[] {
  const commands: any[] = [];

  Object.keys(approvedSuggestions)
    .sort()
    .forEach((key: string) => {
      commands.push(...approvedSuggestions[key]);
    });

  pendingEndpoints.forEach((i) => {
    if (i.staged) {
      const commandsForThisEndpoint = i.ref.state.context.allCommands;
      commands.push(...commandsForThisEndpoint);
    }
  });

  Object.values(existingEndpointNameContributions).forEach((command) => {
    commands.push(command);
  });

  return commands;
}
