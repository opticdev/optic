import React, { useEffect, useState } from 'react';
import { useParams, useRouteMatch, matchPath } from 'react-router-dom';
import { ApiSpecServiceLoader } from '../components/loaders/ApiLoader';
import { LightTooltip } from '../components/tooltips/LightTooltip';
import { DemoModal } from '../components/DemoModal';
import {
  Provider as DebugSessionContextProvider,
  useMockSession,
} from '../contexts/MockDataContext';
import { ApiRoutes } from '../routes';
import { Provider as BaseUrlContext } from '../contexts/BaseUrlContext';
import {
  ExampleCaptureService,
  ExampleDiffService,
} from '../services/diff/ExampleDiffService';
import { DiffHelpers, JsonHelper, RfcCommandContext } from '@useoptic/domain';
import { useSnackbar } from 'notistack';
import {
  cachingResolversAndRfcStateFromEventsAndAdditionalCommands,
  normalizedDiffFromRfcStateAndInteractions,
} from '@useoptic/domain-utilities';

export default function DemoSessions(props) {
  const match = useRouteMatch();
  const { sessionId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [actionsCompleted, setActions] = useState(0);
  const [snack, setSnack] = useState(null);

  setInterval(() => {
    setShowModal(true);
  }, 180000)

  const session = useMockSession({
    sessionId: sessionId,
    exampleSessionCollection: 'demos',
  });

  const captureServiceFactory = async (specService, captureId) => {
    return new ExampleCaptureService(specService);
  };

  const diffServiceFactory = async (
    specService,
    captureService,
    _events,
    _rfcState,
    additionalCommands,
    config,
    captureId
  ) => {
    async function computeInitialDiff() {
      const capture = await specService.listCapturedSamples(captureId);
      const commandContext = new RfcCommandContext(
        'simulated',
        'simulated',
        'simulated'
      );

      const {
        resolvers,
        rfcState,
      } = cachingResolversAndRfcStateFromEventsAndAdditionalCommands(
          _events,
        commandContext,
        additionalCommands
      );
      let diffs = DiffHelpers.emptyInteractionPointersGroupedByDiff();
      for (const interaction of capture.samples) {
          diffs = DiffHelpers.groupInteractionPointerByDiffs(
          resolvers,
          rfcState,
          JsonHelper.fromInteraction(interaction),
          interaction.uuid,
          diffs
        );
      }
      return {
        diffs,
        rfcState,
        resolvers,
      };
    }

    const { diffs, rfcState } = await computeInitialDiff();

    return new ExampleDiffService(
      specService,
      captureService,
      config,
      diffs,
      rfcState
    );
  };
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  console.log(closeSnackbar)
  // const [snackId, setSnackId] = useSnackbar(0);

  // setting the right info box
  let message = "nothing";

  if (props.location.pathname.includes("diffs/example-session/paths")) {
    message = "Here, we can see the different requests that this route has experienced, and we can document it"
  } else if (props.location.pathname.includes("diffs")) {
    message = "Start by selecting some undocumented URLs"
  } else if (props.location.pathname.includes("documentation/paths")) {
    message = "We can add a description and inspect the shape of the expected response and request"
  } else if (props.location.pathname.includes("documentation")) {
    message = "Select some of the existing documentation and add some details"
  } else if (props.location.pathname.includes("testing/captures")) {
    message = "Here is an example of our contract testing page"
  }
  console.log(props.location)

  // if (snackId !== null) {
  //   closeSnackbar(snackId);
  // }

  if (message !== "nothing") {
    enqueueSnackbar(message, { variant: "info", preventDuplicate: true, anchorOrigin: {
      horizontal: "center",
      vertical: "bottom"
    }});
  }

  const demoEventCallback = (data) => {
    setActions(actionsCompleted + 1)
    console.log(data)
  }

  return (
    <>
      <BaseUrlContext value={{ path: match.path, url: match.url }}>
        <DebugSessionContextProvider value={session}>
          <ApiSpecServiceLoader
            demoEventCallback={demoEventCallback}
            captureServiceFactory={captureServiceFactory}
            diffServiceFactory={diffServiceFactory}
          >
            <ApiRoutes demoEventCallback={demoEventCallback} />
            { (actionsCompleted >= 2 || showModal) && <DemoModal onCancel={() => {setActions(0); setShowModal(false);}} />}
          </ApiSpecServiceLoader>
        </DebugSessionContextProvider>
      </BaseUrlContext>
    </>
  );
}
