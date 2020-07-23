import React, { useEffect, useState } from 'react';
import { useParams, useRouteMatch, useHistory } from 'react-router-dom';
import { ApiSpecServiceLoader } from '../components/loaders/ApiLoader';
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
} from '@useoptic/domain-utilities';
import { Button } from '@material-ui/core';
import { trackEmitter } from "../Analytics"

export default function DemoSessions(props) {
  const match = useRouteMatch();
  const { sessionId } = useParams();
  const [showModal, setShowDemoModal] = useState(false);
  const [actionsCompleted, setActions] = useState(0);
  const history = useHistory();

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

  // show demo modal after 3 Minutes
  setInterval(() => {
    setShowDemoModal(true);
  }, 180000)

  // info boxes / guides for the demo
  const { enqueueSnackbar } = useSnackbar();
  const [message, setMessage] = useState("nothing")
  const [action, setAction] = useState(null)
  const [hasCommited, setHasCommited] = useState(false) 

  // path specific info boxes
  useEffect(() => {
    /*if (props.location.pathname.includes("diffs/example-session/paths")) {
      setAction(null)
      setMessage("Here, we can see the different requests that this route has experienced, and we can document it")
    } else */if (props.location.pathname.includes("documentation/paths")) {
      setAction(null)
      setMessage("We can add a description and inspect the shape of the expected response and request")
    } else if (props.location.pathname.includes("documentation")) {
      setAction(null)
      setMessage("Select some of the existing documentation and add some details")
    } else if (props.location.pathname.includes("testing/captures") && props.location.pathname.includes("endpoints")) {
      setAction(null)
      setMessage("We can see that there is an undocumented field")
    } else if (props.location.pathname.includes("testing/captures")) {
      setAction(null)
      setMessage("Choose an endpoint to see if it's fufilling its contract")
    } 
  }, [props.location.pathname])

  // event specific info boxes
  trackEmitter.on('event', (event, eventProps) => {
    switch (event) {
      case "Show Initial Documentation Page" : {
        setAction(null)
        setMessage("Here, we can see the different requests that this route has experienced, and we can document it")
        break
      }
      case "Changed to UNDOCUMENTED_URL": {
        if (!hasCommited && props.location.pathname.includes("diffs")) { // we don't need to keep telling them things they already did
        const undocumentedUrlCount = eventProps.undocumentedUrlCount

        if (undocumentedUrlCount > 0) {
            setAction(null)
            setMessage("Here, we can see all routes that have not been documented yet. Let's select one to document")
          } else {
            setAction({
              onClick: () => {
                setAction(null)
                history.push("/demos/todo/documentation")
              },
              title: "See Documentation"
            })
            setMessage(`All Undocumented URLs have been added to the specification`)
          }
        }
        break
      }
      case "Navigating to Review Diff":
      case "Changed to ENDPOINT_DIFF": {
        if (!hasCommited && props.location.pathname.includes("diffs")) { // we don't need to keep telling them things they already did
          setAction(null)
          const diffAmount = eventProps.diffCount

          if (diffAmount > 0) {
            setMessage(`Here, we can see all if the endpoints are following the behavior we previously documented. Let's select a diff to review`)
          } else {
            setMessage(`Because we've documented all changes in our API's behavior, we can see that the requests are following the expected behavior, and that there are no diffs`)
          }
        }
        break
      }
      case "Clicked Undocumented Url" : {
        setAction(null)
        setMessage(`Since our route is using a path parameter, we can tell Optic to recognize the pattern. Click on ${eventProps.path.split("/").pop()} and change it to say "todo_id"`)
        break
      }
      case "Naming Endpoint" : {
        const exampleEndpointName = eventProps.method === "GET" ? "Get specific TODO Item" : "Update Specific TODO Item"
        setAction(null)
        setMessage(`Now, let's give it a name. For example, we can call this endpoint "${exampleEndpointName}"`)
        break
      }
      case "Rendered Finalize Card": {
        setAction(null)
        setMessage("Optic documents changes in API Behavior, not just code. Now that we've documented changes, we can mark this change in behavior")
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
      case "Viewing Endpoint Diff" : {
        setAction(null)
        setMessage(`Optic detected a change from the previously documented behavior here. Now, we can update the documentation and commit that change in behavior. Let's add priority as a field, and make it optional.`)
        break
      }
      default: {
        break
      }
    }
  })

  useEffect(() => {
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
  }, [message, action, enqueueSnackbar])


  return (
    <>
      <BaseUrlContext value={{ path: match.path, url: match.url }}>
        <DebugSessionContextProvider value={session}>
          <ApiSpecServiceLoader
            captureServiceFactory={captureServiceFactory}
            diffServiceFactory={diffServiceFactory}
          >
            <ApiRoutes />
            { (actionsCompleted >= 2 || showModal) && <DemoModal onCancel={() => {setActions(0); setShowDemoModal(false);}} />}
          </ApiSpecServiceLoader>
        </DebugSessionContextProvider>
      </BaseUrlContext>
    </>
  );
}
