import React, { FC } from 'react';

import { CQRSCommand } from '@useoptic/optic-domain';
import { SimulatedCommandStore } from '<src>/components';
import { useSpectacleContext } from '<src>/contexts/spectacle-provider';
import { useFetchEndpoints } from '<src>/hooks/useFetchEndpoints';

const DataFetcherComponent: FC<{ batchId?: string }> = ({
  children,
  batchId,
}) => {
  useFetchEndpoints(batchId);
  return <>{children}</>;
};

type SimualtedDiffPreviewProps = {
  previewCommands: CQRSCommand[];
};

export const SimulatedDiffPreview: FC<SimualtedDiffPreviewProps> = ({
  previewCommands,
  children,
}) => {
  const spectacle = useSpectacleContext();

  return (
    <SimulatedCommandStore
      spectacle={spectacle}
      previewCommands={previewCommands}
    >
      {(batchId) => (
        <DataFetcherComponent batchId={batchId}>
          {children}
        </DataFetcherComponent>
      )}
    </SimulatedCommandStore>
  );
};
