import React, { useContext, useEffect, useState } from 'react';
import { IForkableSpectacle, IBaseSpectacle } from '@useoptic/spectacle';
import { SpectacleStore } from '../../../spectacle-implementations/spectacle-provider';

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
  useEffect(() => {
    async function task() {
      const simulated = await props.spectacle.fork();
      await simulated.mutate({
        query: `
mutation X($commands: [JSON]) {
  applyCommands(commands: $commands) {
    batchCommitId
  }
}
        `,
        variables: {
          commands: props.previewCommands,
        },
      });
      //@ts-ignore
      simulated.thiscontext = 'simulated';
      setIsProcessing(false);
      setSimulated(simulated as IForkableSpectacle);
    }

    task();
  }, [JSON.stringify(props.previewCommands)]);
  if (isProcessing) {
    return <div>working...</div>;
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
