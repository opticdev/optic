import React, { useContext, useEffect, useState } from 'react';
import { IForkableSpectacle, IBaseSpectacle } from '@useoptic/spectacle';

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
  useEffect(() => {
    async function task() {
      debugger;
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
          commands: props.previewCommands
        }
      });
      setIsProcessing(false);
    }

    task();
  }, [JSON.stringify(props.previewCommands)]);
  if (isProcessing) {
    return <div>working...</div>;
  }
  return (
    <SimulatedCommandContext.Provider value={value}>
      {props.children}
    </SimulatedCommandContext.Provider>
  );
}

export function useSimulatedCommands() {
  const { previewCommands } = useContext(SimulatedCommandContext);
  return previewCommands;
}
