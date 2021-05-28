import { CQRSCommand } from '@useoptic/spectacle';
import { IPendingEndpoint } from '<src>/pages/diffs/contexts/SharedDiffState';
import { recomputePendingEndpointCommands } from '<src>/pages/diffs/contexts/LearnInitialBodiesMachine';

export function AssembleCommands(
  newPaths: {
    commands: CQRSCommand[];
    pendingEndpointMap: { [key: string]: string };
  },
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
  const commands: CQRSCommand[] = [...newPaths.commands];

  Object.keys(approvedSuggestions)
    .sort()
    .forEach((key: string) => {
      commands.push(...approvedSuggestions[key]);
    });

  pendingEndpoints.forEach((i) => {
    if (i.staged) {
      const commandsForThisEndpoint = recomputePendingEndpointCommands(
        [],
        newPaths.pendingEndpointMap[i.id],
        i.ref.state.context
      );
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
