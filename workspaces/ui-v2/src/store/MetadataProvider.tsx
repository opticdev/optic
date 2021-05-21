import React, { createContext, FC, useContext } from 'react';
import { useSpectacleQuery } from '<src>/spectacle-implementations/spectacle-provider';
import { FullPageLoader } from '<src>/optic-components/loaders';

type MetadataContextValue = {
  id: string;
};

const SpectacleMetadataQuery = `{
  metadata {
    id
  }
}`;

type SpectacleMetadataResponse = {
  metadata: {
    id: string;
  };
};

const MetadataContext = createContext<MetadataContextValue | null>(null);

export const SpecMetadataProvider: FC = ({ children }) => {
  const spectacleResult = useSpectacleQuery<SpectacleMetadataResponse>({
    query: SpectacleMetadataQuery,
    variables: {},
  });

  if (spectacleResult.loading) {
    return <FullPageLoader title="loading" />;
  }
  if (spectacleResult.error) {
    // TODO have error renderer
    return <>error</>;
  }

  return (
    <MetadataContext.Provider value={spectacleResult.data.metadata}>
      {children}
    </MetadataContext.Provider>
  );
};

export const useSpecMetadata = () => {
  const value = useContext(MetadataContext);
  if (!value) {
    throw new Error('SpecMetadataProvider was not found');
  }
  return value;
};
