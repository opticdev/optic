import * as React from 'react';
import { IOpticCapturesService, ICapture } from '@useoptic/spectacle';
import { useContext, useEffect, useState } from 'react';

export function useCaptures(): {
  captures: ICapture[];
  loading?: boolean;
  error?: any;
} {
  const capturesService = useContext(CapturesServiceContext)!;
  const [captures, setCaptures] = useState<ICapture[] | null>(null)
  useEffect(() => {
    async function task() {
      const captures = await capturesService.listCaptures()
      setCaptures(captures)
    }

    task()
  }, [capturesService])
  if (captures === null) {
    return { captures: [], loading: true };
  }
  return {
    captures,
    loading: false
  }
}

interface CapturesServiceStoreProps {
  capturesService: IOpticCapturesService,
  children: any
}

export const CapturesServiceContext = React.createContext<IOpticCapturesService | null>(null);

export function CapturesServiceStore(props: CapturesServiceStoreProps) {
  return (
    <CapturesServiceContext.Provider value={props.capturesService}>
      {props.children}
    </CapturesServiceContext.Provider>
  );
}