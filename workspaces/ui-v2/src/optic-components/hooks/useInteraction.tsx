import { useContext, useEffect, useState } from 'react';
import { AsyncStatus } from '../../spectacle-implementations/spectacle-provider';
import { CapturesServiceContext } from './useCapturesHook';

export function useInteraction(
  captureId: string,
  pointer: string
): AsyncStatus<any> {
  const capturesService = useContext(CapturesServiceContext);

  const [result, setResult] = useState<AsyncStatus<any>>({
    loading: true,
    error: false,
    data: null,
  });

  useEffect(() => {
    if (capturesService) {
      capturesService
        .loadInteraction(captureId, pointer)
        .then((i: any | undefined) => {
          //@aidan handle undefined interactions as the rror state
          setResult({ loading: false, error: false, data: i });
        });
    } else {
      setResult({ loading: false, error: true, data: null });
    }
  }, [pointer, captureId, capturesService]);

  return result;
}
