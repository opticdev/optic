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
import { trackEmitter } from "../Analytics"

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
  // const [info, setInfo] = useState(true);
  // const [needToCheckInfo, setNeedToCheckInfo] = useState(true);

  // setting the right info box
  const [message, setMessage] = useState("nothing")

  console.log(props.location)

  useEffect(() => {
    if (props.location.pathname.includes("diffs/example-session/paths")) {
      setMessage("Here, we can see the different requests that this route has experienced, and we can document it")
    } else if (props.location.pathname.includes("diffs/example-session")) {
      setMessage("Welcome to Optic! Let's start by selecting an undocumented URL!")
    } else if (props.location.pathname.includes("documentation/paths")) {
      setMessage("We can add a description and inspect the shape of the expected response and request")
    } else if (props.location.pathname.includes("documentation")) {
      setMessage("Select some of the existing documentation and add some details")
    } else if (props.location.pathname.includes("testing/captures") && props.location.pathname.includes("endpoints")) {
      setMessage("We can see that there is an undocumented field")
    } else if (props.location.pathname.includes("testing/captures")) {
      setMessage("Choose an endpoint to see if it's fufilling its contract")
    } 
  }, [props.location.pathname])

  trackEmitter.on('event', (event, props) => {
    switch (event) {
      case "Changed to UNDOCUMENTED_URL": {
        setMessage("Here, we can see all routes that have not been documented yet. Let's select one to document")
        break
      }
      case "Changed to ENDPOINT_DIFF": {
        setMessage("Here, we can see all if the endpoints are following the behavior we previously documented. Let's select a diff to review")
        break
      }
      case "Adding Endpoint" : {
        setMessage(`Since our route is using a path parameter, we can tell Optic to recognize the pattern. Click on ${props.path.split("/").pop()} and change it to say "todo_id"`)
        break
      }
      case "Naming Endpoint" : {
        // const exampleEndpointName = props.method === "GET" ? "Get specific TODO Item" : "Update Specific TODO Item"
        setMessage(`Now, let's give it a name. For example, we can call this endpoint "${"exampleEndpointName"}"`)
        break
      }
      default: {
        break
      }
    }
    // console.log("event:")
    // console.log(event)
    // console.log(props)
  })

  if (message !== "nothing" /*&& info*/) {
    enqueueSnackbar(message, { variant: "info", preventDuplicate: true, persist: true, anchorOrigin: {
      horizontal: "center",
      vertical: "bottom",
    }});
  }

  // if (needToCheckInfo) {
  //   const options = key => (
  //     <Fragment>
  //       <Button variant="primary" onClick={() => { closeSnackbar(key); setInfo(true); setNeedToCheckInfo(false) }}>
  //             Yes
  //         </Button>
  //         <Button variant="secondary" onClick={() => { closeSnackbar(key); setInfo(false); setNeedToCheckInfo(false) } }>
  //             No Thanks
  //         </Button>
  //     </Fragment>
  // );
  //   enqueueSnackbar("Do you want info guides?", { variant: "info", persist: true, preventDuplicate: true, anchorOrigin: {
  //     horizontal: "right",
  //     vertical: "top"
  //   },
  //   action: options})
  // }

  // const demoEventCallback = (data) => {
  //   setActions(actionsCompleted + 1)
  //   console.log(data)
  // }

  return (
    <>
      <BaseUrlContext value={{ path: match.path, url: match.url }}>
        <DebugSessionContextProvider value={session}>
          <ApiSpecServiceLoader
            captureServiceFactory={captureServiceFactory}
            diffServiceFactory={diffServiceFactory}
          >
            <ApiRoutes />
            { (actionsCompleted >= 2 || showModal) && <DemoModal onCancel={() => {setActions(0); setShowModal(false);}} />}
          </ApiSpecServiceLoader>
        </DebugSessionContextProvider>
      </BaseUrlContext>
    </>
  );
}
