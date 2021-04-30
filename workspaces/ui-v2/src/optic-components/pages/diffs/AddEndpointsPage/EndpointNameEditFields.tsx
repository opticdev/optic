import React, { FC } from 'react';

import { getEndpointId } from '../../../utilities/endpoint-utilities';
import { useDebouncedFn, useStateWithSideEffect } from '../../../hooks/util';
import { IEndpoint } from '../../../hooks/useEndpointsHook';
import { IPendingEndpoint } from '../../../hooks/diffs/SharedDiffState';
import { useSharedDiffContext } from '../../../hooks/diffs/SharedDiffContext';
import { EditableTextField, TextFieldVariant } from '../../../common';

export const PendingEndpointNameField: FC<{
  endpoint: IPendingEndpoint;
}> = ({ endpoint }) => {
  const {
    getPendingEndpointById,
    setPendingEndpointName,
  } = useSharedDiffContext();
  const pendingEndpointFromStore = getPendingEndpointById(endpoint.id);
  const debouncedSet = useDebouncedFn(setPendingEndpointName, 200);

  const { value, setValue } = useStateWithSideEffect({
    initialValue:
      pendingEndpointFromStore?.ref.state.context.stagedEndpointName || '',
    sideEffect: (newName: string) => debouncedSet(endpoint.id, newName),
  });

  return (
    <EditableTextField
      isEditing={true}
      setEditing={() => {}}
      value={value}
      setValue={setValue}
      variant={TextFieldVariant.SMALL}
    />
  );
};

export const ExistingEndpointNameField: FC<{
  endpoint: IEndpoint;
}> = ({ endpoint }) => {
  const endpointId = getEndpointId({
    method: endpoint.method,
    pathId: endpoint.pathId,
  });
  const { setEndpointName: setGlobalDiffEndpointName } = useSharedDiffContext();

  const debouncedSet = useDebouncedFn(setGlobalDiffEndpointName, 200);

  const { value, setValue } = useStateWithSideEffect({
    initialValue: endpoint.purpose,
    sideEffect: (newName: string) => debouncedSet(endpointId, newName),
  });

  return (
    <EditableTextField
      isEditing={true}
      setEditing={() => {}}
      value={value}
      setValue={setValue}
      variant={TextFieldVariant.SMALL}
    />
  );
};
