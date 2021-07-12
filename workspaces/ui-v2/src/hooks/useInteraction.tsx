import { useContext, useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import { IHttpInteraction } from '@useoptic/optic-domain';
import { AsyncStatus } from '<src>/types';
import { CapturesServiceContext } from './useCapturesHook';

export function useInteraction(
  captureId: string,
  pointer: string
): AsyncStatus<IHttpInteraction> {
  const capturesService = useContext(CapturesServiceContext);

  const [result, setResult] = useState<AsyncStatus<IHttpInteraction>>({
    loading: true,
  });

  useEffect(() => {
    if (capturesService) {
      capturesService
        .loadInteraction(captureId, pointer)
        .then((interaction: IHttpInteraction) => {
          setResult({ loading: false, data: interaction });
        })
        .catch((e) => {
          console.error(
            `Could not find interaction  ${pointer} for capture ${captureId}`
          );
          Sentry.captureException(e);
          setResult({ loading: false, error: e });
        });
    } else {
      setResult({ loading: false, error: new Error() });
    }
  }, [pointer, captureId, capturesService]);

  return result;
}
