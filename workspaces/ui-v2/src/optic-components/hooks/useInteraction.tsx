import { useContext, useEffect, useState } from 'react';
import { AsyncStatus } from '<src>/types';
import { CapturesServiceContext } from './useCapturesHook';

export function useInteraction(
  captureId: string,
  pointer: string
): AsyncStatus<any> {
  const capturesService = useContext(CapturesServiceContext);

  const [result, setResult] = useState<AsyncStatus<any>>({
    loading: true,
  });

  useEffect(() => {
    if (capturesService) {
      capturesService
        .loadInteraction(captureId, pointer)
        .then((i: any | undefined) => {
          //@aidan handle undefined interactions as the rror state
          setResult({ loading: false, data: i });
        });
    } else {
      setResult({ loading: false, error: new Error() });
    }
  }, [pointer, captureId, capturesService]);

  return result;
}
