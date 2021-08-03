import React, { useEffect, useState } from 'react';

import { CQRSCommand } from '@useoptic/optic-domain';

import { ShapeFetcher, SimulatedCommandStore } from '<src>/components';
import { useSpectacleContext } from '<src>/contexts/spectacle-provider';
import { useAppSelector } from '<src>/store';
import { IShapeRenderer } from '<src>/types';

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
  const [previewCommands, setPreviewCommands] = useState<CQRSCommand[]>([]);
  // Commands that generate commands - removed fields
  const removedFields = useAppSelector(
    (state) => state.documentationEdits.fieldEdits.removedFields
  );

  useEffect(() => {
    let isStale = false;
    (async () => {
      // TODO FLEB add in edited fields
      const removeFieldCommandsPromise: Promise<CQRSCommand[]> = Promise.all(
        removedFields.map((fieldId) => {
          // TODO FLEB generate removed field id via spectacle
          return Promise.resolve([
            {
              RemoveField: {
                fieldId,
              },
            },
          ]);
        })
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
  }, [removedFields]);

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
