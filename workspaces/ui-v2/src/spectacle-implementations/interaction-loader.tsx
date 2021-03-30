import React, { useContext, useEffect, useState } from 'react';
import { AsyncStatus } from './public-examples';

type InteractionLoader = {
  loadInteraction: (pointer: string) => Promise<any | undefined>;
};

export const InteractionLoaderContext = React.createContext<InteractionLoader>({
  loadInteraction: async (pointer) => {
    return undefined;
  },
});

export const InMemoryInteractionLoaderStore = (props: {
  samples: any[];
  children: any;
}) => {
  const loadInteraction = async (pointer: string) => {
    return props.samples.find((i) => i.uuid === pointer);
  };

  return (
    <InteractionLoaderContext.Provider value={{ loadInteraction }}>
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
  }, [pointer]);

  return result;
}
