import React, { FC, useEffect } from 'react';
import { FullPageLoader } from '<src>/components';
import { metadataActions, useAppDispatch, useAppSelector } from '<src>/store';
import { useSpectacleContext } from './spectacle-provider';
import { useConfigRepository } from './OpticConfigContext';

export const MetadataLoader: FC = ({ children }) => {
  const spectacle = useSpectacleContext();
  const { config: configRepository } = useConfigRepository();
  const dispatch = useAppDispatch();
  const result = useAppSelector((state) => state.metadata);

  useEffect(() => {
    dispatch(
      metadataActions.fetchMetadata({
        configRepository,
        spectacle,
      })
    );
  }, [spectacle, configRepository, dispatch]);

  if (result.loading) {
    return <FullPageLoader title="loading" />;
  }
  if (result.error) {
    return <>error</>;
  }

  return <>{children}</>;
};
