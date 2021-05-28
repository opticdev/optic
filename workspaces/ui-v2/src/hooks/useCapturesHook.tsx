import React, { FC } from 'react';
import { IOpticCapturesService, ICapture } from '@useoptic/spectacle';
import { useContext, useEffect, useState } from 'react';

export function useCaptures(): {
  captures: ICapture[];
  loading?: boolean;
  error?: any;
} {
  const capturesService = useContext(CapturesServiceContext)!;
  const [captures, setCaptures] = useState<ICapture[] | null>(null);
  useEffect(() => {
    let shouldCancel = false;
    async function task() {
      const captures = await capturesService.listCaptures();
      if (!shouldCancel) {
        setCaptures(captures);
      }
    }

    task();
    return () => {
      shouldCancel = true;
    };
  }, [capturesService]);
  if (captures === null) {
    return { captures: [], loading: true };
  }
  return {
    captures,
    loading: false,
  };
}

interface CapturesServiceStoreProps {
  capturesService: IOpticCapturesService;
}

export const CapturesServiceContext = React.createContext<IOpticCapturesService | null>(
  null
);

export const CapturesServiceStore: FC<CapturesServiceStoreProps> = (props) => {
  return (
    <CapturesServiceContext.Provider value={props.capturesService}>
      {props.children}
    </CapturesServiceContext.Provider>
  );
};
