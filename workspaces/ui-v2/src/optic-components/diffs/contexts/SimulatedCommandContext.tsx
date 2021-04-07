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
  useEffect(() => {
    async function task() {
      debugger;
      //const simulated = await props.spectacle.fork();
      props.spectacle.mutate({
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
    }

    task();
  }, [JSON.stringify(props.previewCommands)]);

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
