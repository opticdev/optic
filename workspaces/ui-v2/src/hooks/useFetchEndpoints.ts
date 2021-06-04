import { useEffect } from 'react';

import { useSpectacleContext } from '<src>/contexts/spectacle-provider';
import { endpointActions, useAppDispatch } from '<src>/store';

export const useFetchEndpoints = () => {
  const dispatch = useAppDispatch();
  const spectacle = useSpectacleContext();
  useEffect(() => {
    dispatch(endpointActions.fetchEndpoints({ spectacle }));
  }, [dispatch, spectacle]);
};
