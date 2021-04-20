import React, { useContext, useEffect, useState } from 'react';
import { AsyncStatus } from './spectacle-provider';

type InteractionLoader = {
  loadInteraction: (pointer: string) => Promise<any | undefined>;
  // @todo remove -- temp until port complete
  allSamples: any[];
};

export const InteractionLoaderContext = React.createContext<InteractionLoader>({
  loadInteraction: async (pointer) => {
    return undefined;
  },
  allSamples: [],
});

export const InMemoryInteractionLoaderStore = (props: {
  samples: any[];
  children: any;
}) => {
  const loadInteraction = async (pointer: string) => {
    return props.samples.find((i) => i.uuid === pointer);
  };

  return (
    <InteractionLoaderContext.Provider
      value={{ loadInteraction, allSamples: props.samples }}
    >
      {props.children}
    </InteractionLoaderContext.Provider>
  );
};

export function useInteraction(pointer: string): AsyncStatus<any> {
  const { loadInteraction } = useContext(InteractionLoaderContext);
  const [result, setResult] = useState<AsyncStatus<any>>({ loading: true });

  useEffect(() => {
    loadInteraction(pointer).then((i) => {
      setResult({ loading: false, data: i });
    });
  }, [pointer, loadInteraction]);

  return result;
}
