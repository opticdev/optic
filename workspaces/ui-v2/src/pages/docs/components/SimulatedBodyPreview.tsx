import React, { useEffect, useMemo, useState } from 'react';

import { CQRSCommand, JsonType } from '@useoptic/optic-domain';

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
  const fieldEdits = useAppSelector((state) => state.documentationEdits.fields);

  useEffect(() => {
    let isStale = false;
    (async () => {
      const { removed: removedFields, edited: editedFields } = fieldEdits;
      const editFieldCommandsPromise: Promise<CQRSCommand[]> = Promise.all(
        Object.entries(editedFields).map(([fieldId, options]) => {
          const requestedTypes: JsonType[] = [];

          if (options.isNullable) {
            requestedTypes.push(JsonType.NULL);
          }
          if (options.isOptional) {
            requestedTypes.push(JsonType.UNDEFINED);
          }

          return spectacleClient.fetchFieldEditCommands(
            fieldId,
            requestedTypes
          );
        })
      ).then((fieldCommands) => fieldCommands.flat());

      const removeFieldCommandsPromise: Promise<CQRSCommand[]> = Promise.all(
        removedFields.map((fieldId) =>
          spectacleClient.fetchFieldRemoveCommands(fieldId)
        )
      ).then((fieldCommands) => fieldCommands.flat());

      const [editFieldCommands, removeFieldCommands] = await Promise.all([
        editFieldCommandsPromise,
        removeFieldCommandsPromise,
      ]);

      if (!isStale) {
        setPreviewCommands([...editFieldCommands, ...removeFieldCommands]);
      }
    })();

    return () => {
      isStale = true;
    };
  }, [fieldEdits, spectacleClient]);

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
