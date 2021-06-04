import { useEffect } from 'react';

import { useSpectacleContext } from '<src>/contexts/spectacle-provider';
import { endpointActions, useAppDispatch } from '<src>/store';

export const useFetchEndpoints = () => {
  const dispatch = useAppDispatch();
  const spectacle = useSpectacleContext();
  useEffect(() => {
    // the typing is correct, we just arent setting it correctly above
    // TODO remove ts-ignore
    // @ts-ignore
    dispatch(endpointActions.fetchEndpoints({ spectacle }));
  }, [dispatch, spectacle]);
};
