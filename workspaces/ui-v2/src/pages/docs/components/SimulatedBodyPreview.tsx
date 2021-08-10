import React, { useEffect, useMemo, useState } from 'react';

import { CQRSCommand } from '@useoptic/optic-domain';

import { ShapeFetcher, SimulatedCommandStore } from '<src>/components';
import { useSpectacleContext } from '<src>/contexts/spectacle-provider';
import { useAppSelector } from '<src>/store';
import { IShapeRenderer } from '<src>/types';
import { SpectacleClient } from '<src>/clients';

type SimulatedBodyProps = {
  rootShapeId: string;
  endpointId: string;
  children: (shapes: IShapeRenderer[]) => React.ReactElement;
};

export const SimulatedBody = ({
  rootShapeId,
  endpointId,
  children,
}: SimulatedBodyProps) => {
  const spectacle = useSpectacleContext();
  const spectacleClient = useMemo(() => new SpectacleClient(spectacle), [
    spectacle,
  ]);
  const [previewCommands, setPreviewCommands] = useState<CQRSCommand[]>([]);
  // Commands that generate commands - removed fields
  const removedFields = useAppSelector(
    (state) => state.documentationEdits.fields.removed
  );

  useEffect(() => {
    let isStale = false;
    (async () => {
      // TODO FLEB add in edited fields
      const removeFieldCommandsPromise: Promise<CQRSCommand[]> = Promise.all(
        removedFields.map((fieldId) =>
          spectacleClient.fetchFieldRemoveCommands(fieldId)
        )
      ).then((fieldCommands) => fieldCommands.flat());

      const [removeFieldCommands] = await Promise.all([
        removeFieldCommandsPromise,
      ]);

      if (!isStale) {
        setPreviewCommands([...removeFieldCommands]);
      }
    })();

    return () => {
      isStale = true;
    };
  }, [removedFields, spectacleClient]);

  return (
    <SimulatedCommandStore
      spectacle={spectacle}
      previewCommands={previewCommands}
    >
      {(batchCommitId) => (
        <ShapeFetcher
          rootShapeId={rootShapeId}
          endpointId={endpointId}
          changesSinceBatchCommit={batchCommitId}
        >
          {children}
        </ShapeFetcher>
      )}
    </SimulatedCommandStore>
  );
};
