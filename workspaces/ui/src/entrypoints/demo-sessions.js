import React, { useEffect, useState, Fragment } from 'react';
import { useParams, useRouteMatch, useHistory } from 'react-router-dom';
import { ApiSpecServiceLoader } from '../components/loaders/ApiLoader';
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
import { Button, Snackbar, makeStyles, Box } from '@material-ui/core';
import { trackEmitter } from "../Analytics"
import MuiAlert from '@material-ui/lab/Alert';

const snackbarStyles = makeStyles({
  snackbar: {
    border: "1px white solid",
    fontSize: "1.2em"
  }
})

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function DemoSessions(props) {
  const match = useRouteMatch();
  const { sessionId } = useParams();
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

  // info boxes / guides for the demo
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [message, setMessage] = useState("nothing")
  const [action, setAction] = useState(null)
  const [hasCommited, setHasCommited] = useState(false) 
  const styles = snackbarStyles();

  // path specific info boxes
  useEffect(() => {
    if (props.location.pathname.includes("documentation/paths")) {
      setAction({
        onClick: () => {
          setAction(null)
          history.push("/demos/todo/diffs")
        },
        title: "Checkout Diff Page"
      })
      setMessage("Descriptions can be added to the endpoint, to the request and responses, and to individual fields.")
    } else if (props.location.pathname.includes("documentation")) {
      setAction(null)
      setMessage(`Details can be added to existing documentation. Click the "Full Documentation" drop-down on an endpoint above.`)
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
        setMessage(`Optic will show you the requests and responses to this endpoint, and the automatically documented traffic shape. Click "Document Bodies" to commit the new documentation to the specification, accepting the changes and making fields optional.`)
        break
      }
      case "Closed AddUrlModal" :
      case "Changed to UNDOCUMENTED_URL": {

        if (!hasCommited && props.location.pathname.includes("diffs")) { // we don't need to keep telling them things they already did
          const undocumentedUrlCount = eventProps.undocumentedUrlCount || 1
          if (undocumentedUrlCount > 0) {
              setAction(null)
              setMessage("The Undocumented URLs page shows all traffic Optic observed to undocumented routes. Click a route to begin.")
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
        break;
      }
      case "Navigating to Review Diff":
      case "Changed to ENDPOINT_DIFF": {
        if (!hasCommited && props.location.pathname.includes("diffs")) { // we don't need to keep telling them things they already did
          setAction(null)
          const diffAmount = eventProps.diffCount
          if (diffAmount > 0) {
            setMessage(`Optic will show you all of the documented endpoints, and if any traffic shows undocumented behavior. Click "Creates a new TODO Item" to investigate.`)
          } else {
            setMessage(`Because we've documented all changes in our API's behavior, we can see that the requests are following the expected behavior, and that there are no diffs`)
          }
        }
        break
      }
      case "On Undocumented Url" :
      case "Clicked Undocumented Url" : {
        setAction(null)
        setMessage("If an API path has parameters, they can be documented for consumers. Click the last component of the path, which is an example of a `todo_id`, and click Next.")
        // setMessage(`Since our route is using a path parameter, we can tell Optic to recognize the pattern. Click on ${eventProps.path.split("/").pop()} and change it to say "todo_id"`)
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
        setMessage("Optic tracks changes in API behavior, somewhat like Git tracks changes in code. Now that we've documented changes in the API behavior, those changes are committed to the API specification.")
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
        setMessage(`Awesome! Now that you've committed changes, let's take a look at the documentation!`)
        break
      }
      case "Viewing Endpoint Diff" : {
        setAction(null)
        setMessage(`Optic detected a change from the previously documented behavior. We can update the documentation and commit that change in behavior to the specification. Let's add priority as a field. Then, make it optional.`)
        break
      }
      default: {
        break
      }
    }
    
  })

  return (
    <>
      <BaseUrlContext value={{ path: match.path, url: match.url }}>
        <DebugSessionContextProvider value={session}>
          <ApiSpecServiceLoader
            captureServiceFactory={captureServiceFactory}
            diffServiceFactory={diffServiceFactory}
          >
            <ApiRoutes getDefaultRoute={(options) => options.diffsRoot} />
            

            <Snackbar open={message !== "nothing"} autoHideDuration={6000}>
              <Alert className={styles.snackbar} severity="info">
                {message}
                { action && <Button color="secondary" onClick={action.onClick}>{action.title}</Button>}
              </Alert>
            </Snackbar>

          </ApiSpecServiceLoader>
        </DebugSessionContextProvider>
      </BaseUrlContext>
    </>
  );
}
