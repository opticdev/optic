import React, { useEffect, useMemo } from 'react';
import { useDiffSession } from './ReviewDiffSession';
// eslint-disable-next-line no-unused-vars
import { useActor, useMachine } from '@xstate/react';
import { useContext } from 'react';
import { useEndpointDiffSession } from './ReviewEndpoint';
import { createEndpointDescriptor } from '../../../utilities/EndpointUtilities';
import { stuffFromQueries } from '../../../contexts/RfcContext';
import sortby from 'lodash.sortby';
import { DiffSummaryRegion } from './DiffSummaryRegion';

export const SingleDiffSessionContext = React.createContext(null);

export function useSingleDiffSession() {
  return useContext(SingleDiffSessionContext);
}

export function ReviewDiff(props) {
  const { diff } = props;

  const { endpointQueries, makeDiffActorHook } = useEndpointDiffSession();

  const useDiffActor = makeDiffActorHook(diff.diffHash);

  const { value, context, diffQueries, diffActions } = useDiffActor();

  console.log('singeDiff', value, context);

  useEffect(() => diffActions.showing(), []);

  const reactContext = {
    value,
    diffQueries,
    diffActions,
  };

  return (
    <SingleDiffSessionContext.Provider value={reactContext}>
      <ReviewDiffInner />
    </SingleDiffSessionContext.Provider>
  );
}

export function ReviewDiffInner(props) {
  const { diff, diffRef, diffQueries } = useSingleDiffSession();

  const status = diffQueries.status();

  return <div>{JSON.stringify(status)}</div>;
  // return <DiffSummaryRegion diff={diff} preview={preview} />;
}
