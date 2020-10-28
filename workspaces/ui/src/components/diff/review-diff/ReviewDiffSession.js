import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  CaptureContext,
  useCaptureContext,
} from '../../../contexts/CaptureContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import { useMachine } from '@xstate/react';
import {
  newDiffSessionSessionMachine,
  sendMessageToEndpoint,
} from '../../../engine/diff-session';
import { useServices } from '../../../contexts/SpecServiceContext';
import { makeDiffRfcBaseState } from '../../../engine/interfaces/diff-rfc-base-state';
import { ParsedDiff } from '../../../engine/parse-diff';
import { ReviewUI } from './ReviewUI';
import { createEndpointDescriptor } from '../../../utilities/EndpointUtilities';
import { useDiffSessionMachine } from '../../../engine/hooks/session-hook';
import { useEndpointDiffMachine } from '../../../engine/hooks/endpoint-hook';
import { RfcContext } from '../../../contexts/RfcContext';

export const DiffSessionContext = React.createContext(null);

export function useDiffSession() {
  return useContext(DiffSessionContext);
}

export function ReviewDiffSession(props) {
  const { captureService, diffService, lastUpdate } = useCaptureContext();

  const { eventStore, rfcService, rfcId } = useContext(RfcContext);

  if (eventStore && rfcService && rfcId && captureService && diffService) {
    const diffId = diffService.diffId();
    const rfcBaseState = makeDiffRfcBaseState(eventStore, rfcService, rfcId);
    return (
      <DiffSessionMachineStore
        key={'diff-machine' + diffId}
        diffId={diffId}
        services={{
          captureService,
          diffService,
          rfcBaseState,
        }}
      >
        <ReviewUI key={'review-ui' + diffId} />
      </DiffSessionMachineStore>
    );
  }

  return (
    <div>
      <LinearProgress />
    </div>
  );
}

export function DiffSessionMachineStore(props) {
  const { children, services, diffId } = props;
  const { captureService, diffService, rfcBaseState } = services;

  const { value, context, actions, queries } = useDiffSessionMachine(diffId, {
    captureService,
    diffService,
    rfcBaseState,
  });

  useEffect(() => {
    console.log('here I AM');
    console.log(value);
    console.log(context);
  }, [value, context]);

  const { completed, rawDiffs } = useCaptureContext();
  //
  useEffect(() => {
    if (completed) actions.signalDiffCompleted(rawDiffs);
  }, [completed]);

  // const actions = useCreateActions(send);
  // const queries = useCreateQueries(() => state, rfcBaseState);
  //
  useEffect(() => {
    /// select first endpoint when ready
    if (value === 'ready') {
      actions.selectEndpoint(
        context.endpoints[0].pathId,
        context.endpoints[0].method
      );
    }
  }, [value]);

  const reactContext = {
    actions,
    queries,
    rfcBaseState,
  };

  return (
    <DiffSessionContext.Provider value={reactContext}>
      {queries.sessionState() === 'ready' ? children : 'loading'}
    </DiffSessionContext.Provider>
  );
}

function useCreateActions(send) {
  return {
    selectEndpoint: (pathId, method) =>
      send({ type: 'SELECTED_ENDPOINT', pathId, method }),
    sendPrepare: (pathId, method) => {
      send(sendMessageToEndpoint(pathId, method, { type: 'PREPARE' }));
    },
  };
}
