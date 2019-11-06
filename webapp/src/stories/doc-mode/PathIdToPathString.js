import React from 'react'
import {asPathTrail, getNameWithFormattedParameters} from '../../components/utilities/PathUtilities';
import {withRfcContext} from '../../contexts/RfcContext';

export const PathIdToPathString = withRfcContext(({pathId: pathComponentId, cachedQueryResults}) => {
  const {pathsById} = cachedQueryResults;
  const path = pathsById[pathComponentId];
  const pathTrail = asPathTrail(pathComponentId, pathsById);
  const pathTrailComponents = pathTrail.map(pathId => pathsById[pathId]);
  const pathTrailWithNames = pathTrailComponents.map((pathComponent) => {
    const pathComponentName = getNameWithFormattedParameters(pathComponent);
    const pathComponentId = pathComponent.pathId;
    return {
      pathComponentName,
      pathComponentId
    };
  });

  return <> {pathTrailWithNames.map(i => i.pathComponentName).join('/') || '/'}</>;
})
