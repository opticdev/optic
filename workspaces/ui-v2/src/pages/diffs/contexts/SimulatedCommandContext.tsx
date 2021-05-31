import React, { useContext, useEffect, useState } from 'react';
import { IForkableSpectacle } from '@useoptic/spectacle';
import { SpectacleStore } from '<src>/contexts/spectacle-provider';
import { v4 as uuidv4 } from 'uuid';
import { useSessionId } from '<src>/hooks/useSessionId';
import { Loading } from '<src>/components';

type SimulatedCommandStoreProps = {
  spectacle: IForkableSpectacle;
  previewCommands: any[];
  children?: any;
};

type SimulatedCommandContextValue = {
  previewCommands: any[];
};

export const SimulatedCommandContext = React.createContext<SimulatedCommandContextValue>(
  { previewCommands: [] }
);

export function SimulatedCommandStore(props: SimulatedCommandStoreProps) {
  const value = { previewCommands: props.previewCommands };
  const [isProcessing, setIsProcessing] = useState(true);
  const [simulated, setSimulated] = useState<IForkableSpectacle | undefined>(
    undefined
  );
  const clientSessionId = useSessionId();
  useEffect(() => {
    async function task() {
      const simulated = await props.spectacle.fork();
      await simulated.mutate({
        query: `
mutation X($commands: [JSON], $batchCommitId: ID, $commitMessage: String, $clientId: ID, $clientSessionId: ID) {
  applyCommands(commands: $commands, batchCommitId: $batchCommitId, commitMessage: $commitMessage, clientId: $clientId, clientSessionId: $clientSessionId) {
    batchCommitId
  }
}
        `,
        variables: {
          commands: props.previewCommands,
          batchCommitId: uuidv4(),
          commitMessage: 'proposed changes',
          clientId: 'simulation-agent', //@TODO: in the future, for features based on the clientId to make sense in the simulated ui, we may need to provide a real id here
          clientSessionId,
        },
      });
      //@ts-ignore
      simulated.thiscontext = 'simulated';
      //@ts-ignore
      simulated.instanceId = uuidv4();
      setSimulated(simulated as IForkableSpectacle);
      setIsProcessing(false);
    }

    task();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props.previewCommands)]);

  if (isProcessing) {
    return <Loading />;
  }

  const spectacleToUse = simulated ? simulated : props.spectacle;

  return (
    <SimulatedCommandContext.Provider value={value}>
      <SpectacleStore spectacle={spectacleToUse}>
        {props.children}
      </SpectacleStore>
    </SimulatedCommandContext.Provider>
  );
}

export function useSimulatedCommands() {
  const { previewCommands } = useContext(SimulatedCommandContext);
  return previewCommands;
}
