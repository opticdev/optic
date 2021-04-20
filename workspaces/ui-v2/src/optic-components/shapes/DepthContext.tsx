import * as React from 'react';
import { useContext } from 'react';

export const DepthContext = React.createContext(0);

type DepthStoreProps = { children: any; depth: number };

export const DepthStore = ({ children, depth }: DepthStoreProps) => {
  return (
    <DepthContext.Provider value={depth}>{children}</DepthContext.Provider>
  );
};

export function useDepth() {
  const depth: number = useContext(DepthContext);
  return {
    depth,
    Indent: (props: React.PropsWithChildren<any>) => {
      return (<DepthStore depth={depth + 1}>{props.children}</DepthStore>);
    },
  };
}
