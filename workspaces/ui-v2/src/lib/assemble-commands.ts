import { CQRSCommand } from '@useoptic/spectacle';
import { IPendingEndpoint } from '../optic-components/hooks/diffs/SharedDiffState';

export function AssembleCommands(
  approvedSuggestions: { [key: string]: CQRSCommand[] },
  pendingEndpoints: IPendingEndpoint[],
  existingEndpointNameContributions: { [id: string]: CQRSCommand },
  existingEndpointPathContributions: {
    [id: string]: {
      command: CQRSCommand;
      endpointId: string;
    };
  }
): CQRSCommand[] {
  const commands: CQRSCommand[] = [];

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

  Object.values(existingEndpointPathContributions).forEach(({ command }) => {
    commands.push(command);
  });

  return commands;
}
