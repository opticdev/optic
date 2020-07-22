import React, { useEffect, useState } from 'react';
import { useParams, useRouteMatch, matchPath, useHistory } from 'react-router-dom';
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
import SetupLink from '../components/testing/SetupLink';
import { Button } from '@material-ui/core';

export default function DemoSessions(props) {
  const match = useRouteMatch();
  const { sessionId } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [actionsCompleted, setActions] = useState(0);
  const [snack, setSnack] = useState(null);
  const history = useHistory()

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
  const [action, setAction] = useState(null)
  const [hasCommited, setHasCommited] = useState(false) 

  useEffect(() => {
    if (props.location.pathname.includes("diffs/example-session/paths")) {
      setMessage("Here, we can see the different requests that this route has experienced, and we can document it")
      setAction(null)
    } else if (props.location.pathname.includes("documentation/paths")) {
      setMessage("We can add a description and inspect the shape of the expected response and request")
      setAction(null)
    } else if (props.location.pathname.includes("documentation")) {
      setMessage("Select some of the existing documentation and add some details")
      setAction(null)
    } else if (props.location.pathname.includes("testing/captures") && props.location.pathname.includes("endpoints")) {
      setMessage("We can see that there is an undocumented field")
      setAction(null)
    } else if (props.location.pathname.includes("testing/captures")) {
      setMessage("Choose an endpoint to see if it's fufilling its contract")
      setAction(null)
    } 
  }, [props.location.pathname])

  // TODO - modify diff page to say Optic detected a change in the spec
  
  // useEffect(() => {
  //   if (props.location.pathname.includes("diffs") && hasCommited) {
  //     setMessage(`Now that you've committed changes, let's take a look at the <a href="/demos/todo/documentation">documentation you created</a>!`)
  //     setAction(null)
  //   }
  // }, [hasCommited, props.location.pathname])

  trackEmitter.on('event', (event, eventProps) => {
    console.log(`hasCommitted = ${hasCommited}, ${props.location.pathname}`)
    switch (event) {
      case "Changed to UNDOCUMENTED_URL": {
        if (!hasCommited && props.location.pathname.includes("diffs")) { // we don't need to keep telling them things they already did
          setMessage("Here, we can see all routes that have not been documented yet. Let's select one to document")
          setAction(null)
        }
        break
      }
      case "Changed to ENDPOINT_DIFF": {
        if (!hasCommited && props.location.pathname.includes("diffs")) { // we don't need to keep telling them things they already did
          setMessage(`Here, we can see all if the endpoints are following the behavior we previously documented. Let's select a diff to review`)
          setAction(null)
        }
        break
      }
      case "Clicked Undocumented Url" : {
        setMessage(`Since our route is using a path parameter, we can tell Optic to recognize the pattern. Click on ${eventProps.path.split("/").pop()} and change it to say "todo_id"`)
        setAction(null)
        break
      }
      case "Naming Endpoint" : {
        const exampleEndpointName = eventProps.method === "GET" ? "Get specific TODO Item" : "Update Specific TODO Item"
        setMessage(`Now, let's give it a name. For example, we can call this endpoint "${exampleEndpointName}"`)
        setAction(null)
        break
      }
      case "Rendered Finalize Card": {
        setMessage("Optic documents changes in API Behavior, not just code. Now that we've documented changes, we can mark this change in behavior")
        setAction(null)
        break
      }
      case "Committed Changes to Endpoint": {
        setHasCommited(true)
        setAction({
          onClick: () => {
            setAction(null)
            history.push("/demos/todo/documentation")
          },
          title: "See Documentation"
        })
        setMessage(`Now that you've committed changes, let's take a look at the documentation!`)
        break
      }
      default: {
        break
      }
    }
    console.log("event:")
    console.log(event)
    // console.log(props)
  })

  if (message !== "nothing" /*&& info*/) {
    if (action) {
      const button = () => <Button onClick={action.onClick}>{action.title}</Button>
      enqueueSnackbar(message, { variant: "info", preventDuplicate: true, autoHideDuration: null, anchorOrigin: {
        horizontal: "center",
        vertical: "bottom",
      }, action: button});
    } else {
      enqueueSnackbar(message, { variant: "info", preventDuplicate: true, autoHideDuration: null, anchorOrigin: {
        horizontal: "center",
        vertical: "bottom",
      }});
    }
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
