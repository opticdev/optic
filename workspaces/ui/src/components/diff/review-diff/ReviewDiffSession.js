import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useCaptureContext } from '../../../contexts/CaptureContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import { sendMessageToEndpoint } from '../../../engine/diff-session';
import { makeDiffRfcBaseState } from '../../../engine/interfaces/diff-rfc-base-state';
import { ReviewUI } from './ReviewUI';
import { useDiffSessionMachine } from '../../../engine/hooks/session-hook';
import { RfcContext } from '../../../contexts/RfcContext';
import { LoadingReviewPage } from './LoadingPage';
import Page from '../../Page';

export const DiffSessionContext = React.createContext(null);

export function useDiffSession() {
  return useContext(DiffSessionContext);
}

export function ReviewDiffSession(props) {
  const { captureService, diffService, lastUpdate } = useCaptureContext();

  const { baseDiffReviewPath } = props;
  const { eventStore, rfcService, rfcId } = useContext(RfcContext);

  if (eventStore && rfcService && rfcId && captureService && diffService) {
    const diffId = diffService.diffId();
    const rfcBaseState = makeDiffRfcBaseState(eventStore, rfcService, rfcId);
    return (
      <DiffSessionMachineStore
        key={'diff-machine' + diffId}
        diffId={diffId}
        baseDiffReviewPath={baseDiffReviewPath}
        services={{
          captureService,
          diffService,
          rfcBaseState,
        }}
      >
        {props.children}
      </DiffSessionMachineStore>
    );
  }

  return <LoadingDiffPage />;
}

export function LoadingDiffPage() {
  return (
    <Page>
      <Page.Navbar mini={true} />
      <Page.Body
        padded={false}
        // style={{ flexDirection: 'row', height: '100vh' }}
      >
        <LinearProgress />
      </Page.Body>
    </Page>
  );
}

export function DiffSessionMachineStore(props) {
  const { children, services, diffId, baseDiffReviewPath } = props;
  const { captureService, diffService, rfcBaseState } = services;

  const { value, context, actions, queries } = useDiffSessionMachine(diffId, {
    captureService,
    diffService,
    rfcBaseState,
    loadInteraction: captureService.loadInteraction.bind(captureService),
  });

  const { completed, rawDiffs, unrecognizedUrlsRaw } = useCaptureContext();
  //
  useEffect(() => {
    if (completed) actions.signalDiffCompleted(rawDiffs, unrecognizedUrlsRaw);
  }, [completed]);

  useEffect(() => {
    /// select first endpoint when ready
    if (value === 'ready') {
      if (context.endpoints.length) {
        actions.selectEndpoint(
          context.endpoints[0].pathId,
          context.endpoints[0].method
        );
      } else if (context.unrecognizedUrls.length) {
        actions.toggleUndocumented(true);
      }
    }
  }, [value]);

  const reactContext = {
    actions,
    queries,
    services,
    rfcBaseState,
    baseDiffReviewPath,
    loadInteraction: (interactionPointer) => {
      return captureService.loadInteraction(interactionPointer);
    },
  };

  return (
    <DiffSessionContext.Provider value={reactContext}>
      {queries.sessionState() === 'ready' ? children : <LoadingReviewPage />}
    </DiffSessionContext.Provider>
  );
}
