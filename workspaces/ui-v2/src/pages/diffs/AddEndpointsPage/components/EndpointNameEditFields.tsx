import React, { FC } from 'react';

import { useDebouncedFn, useStateWithSideEffect } from '<src>/hooks/util';
import { IPendingEndpoint } from '<src>/pages/diffs/contexts/SharedDiffState';
import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import { EditableTextField, TextFieldVariant } from '<src>/components';
import { IEndpoint } from '<src>/types';
import { getEndpointId } from '<src>/utils';

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
      defaultText="name for this endpoint"
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
  const {
    setEndpointName: setGlobalDiffEndpointName,
    getContributedEndpointName,
  } = useSharedDiffContext();
  const debouncedSet = useDebouncedFn(setGlobalDiffEndpointName, 200);
  const { value, setValue } = useStateWithSideEffect({
    initialValue: getContributedEndpointName(endpointId) || endpoint.purpose,
    sideEffect: (newName: string) => debouncedSet(endpointId, newName),
  });

  return (
    <EditableTextField
      isEditing={true}
      setEditing={() => {}}
      value={value}
      setValue={setValue}
      variant={TextFieldVariant.SMALL}
      defaultText="name for this endpoint"
    />
  );
};
