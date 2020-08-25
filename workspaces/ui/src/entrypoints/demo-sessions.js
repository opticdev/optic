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
import { UpdatedBlueBackground, ColorButton, SubtleBlueBackground } from "../theme"
import { subtabs } from "../components/diff/v2/CaptureManagerPage"

const snackbarStyles = makeStyles({
  alert: {
    border: `1px white solid`,
    fontSize: "1.2em",
  },
  code: {
    fontFamily: "'Source Code Pro', monospace",
    fontWeight: 600,
    paddingLeft: 2,
    paddingRight: 2,
    paddingTop: 1,
    paddingBottom: 1,
    wordBreak: 'break-word',
    backgroundColor: UpdatedBlueBackground,
  },
  buttonWrapper: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "1em",
  },
  message: {
    color: SubtleBlueBackground,
    paddingRight: 15
  },
  wrapper: {
    display: "flex",
    flexDirection: "column"
  },
  ctaButton: {
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
  const [message, setMessage] = useState({
    message: "informational tooltip is loading",
    action: {
      text: "Button Text",
      href: "/demos/todo",
    }
  })
  const [commits, setCommits] = useState(0)
  const trackCommit = () => setCommits(commits + 1)
  const [hasCommited, setHasCommited] = useState(false) 
  const [route, setRoute] = useState("");
  const styles = snackbarStyles();
  const [showTooltips, setShowTooltips] = useState(true);
  const disableTooltips = () => setShowTooltips(false);
  const [hasDocumentedAllEndpointDiffs, setDocumentedAllEndpointDiffs] = useState(false);

  // path specific info boxes
  useEffect(() => {
    if (props.location.pathname.includes("documentation/paths")) {
      // then be like "Lets document a new endpoint" (force the right tab when you redirect)
      setMessage({
        message: `Here is the specification for your endpoint. You can add custom descriptions anywhere to help explain how the endpoint works.`,
      })
    } else if (props.location.pathname.includes("documentation")) {
      setMessage({
        message: `Details can be added to existing documentation. Click the "Full Documentation" drop-down on an endpoint above.`,
      })
    } else if (props.location.pathname.includes("testing/captures") && props.location.pathname.includes("endpoints")) {
      setMessage({
        message: "We can see that there is an undocumented field"
      })
    } else if (props.location.pathname.includes("testing/captures")) {
      setMessage({
        message: "Choose an endpoint to see if it's fufilling its contract"
      })
    } 
    const r = props.location.pathname.match(/paths\/(.*)/);
    if (r !== null) {
      setRoute(r.pop());
    }
  }, [props.location.pathname])

  // event specific info boxes
  trackEmitter.on('event', (event, eventProps) => {
    switch (event) {
      case "updateContribution": {
        setMessage({
          message: `Nice! Descriptions will stay attached to their endpoint/fields even when the specification changes!\n\nLet's check back and see if there are any other diffs to approve`,
          action: {
            text: "Review all diffs",
            href: `/demos/todo/diffs/example-session?tab=${hasDocumentedAllEndpointDiffs ? subtabs.UNDOCUMENTED_URL : subtabs.ENDPOINT_DIFF}`
          }
        });
        break;
      }
      case "Show Initial Documentation Page" : {
        setMessage({
          message: `On the left, Optic is showing an example request it observed. The right panel shows the shape Optic detected from that request\n\nTo add this to your documentation, simply click "Document Bodies"`
        })
        break
      }
      case "Closed AddUrlModal" :
      case "Changed to UNDOCUMENTED_URL": {

        if (!hasCommited && props.location.pathname.includes("diffs")) { // we don't need to keep telling them things they already did
          const undocumentedUrlCount = eventProps.undocumentedUrlCount || 1
          if (undocumentedUrlCount > 0) {
              setMessage({
                message: "Here, Optic is showing all urls that received traffic but have not been documented. \n\nChoose a url to document it"
              })
          } else {
            setMessage({
              message: `All Undocumented URLs have been added to the specification`,
              action: {
                text: "See Documentation",
                href: `/demos/todo/documentation/paths/${route}`
              }
            })
          }
        }
        break;
      }
      case "Navigating to Review Diff":
      case "Changed to ENDPOINT_DIFF": {
        if (!hasCommited && props.location.pathname.includes("diffs")) { // we don't need to keep telling them things they already did
          const diffAmount = eventProps.diffCount
          if (diffAmount > 0) {
            setMessage({
              message: `Optic shows all your API endpoints. If any endpoints exhibit undocumented behavior, Optic detects it\n\nExample: Click "Creates a new Todo Item" to Review the Diff`
            })
          } else {
            setMessage({
              message: `Because we've documented all changes in our API's behavior, we can see that the requests are following the expected behavior, and that there are no diffs`
            })
          }
        }
        break
      }
      case "On Undocumented Url" :
      case "Clicked Undocumented Url" : {
        setMessage({
          message: "If an API path has parameters, they can be documented for consumers. Click the last component of the path, which is an example of a `todo_id`, and click Next."
        })
        // setMessage(`Since our route is using a path parameter, we can tell Optic to recognize the pattern. Click on ${eventProps.path.split("/").pop()} and change it to say "todo_id"`)
        break
      }
      case "Naming Endpoint" : {
        const exampleEndpointName = eventProps.method === "GET" ? "Get specific TODO Item" : "Update Specific TODO Item"
        setMessage({
          message: `Now, let's give it a name. For example, we can call this endpoint "${exampleEndpointName}"`
        })
        break
      }
      case "Rendered Finalize Card": {
        setMessage({ message: "To commit these changes to your API Specification, click commit! Optic is recording the history of your API changes, somewhat like Git tracks changes in code."})
        break
      }
      case "Committed Changes to Endpoint": {
        setHasCommited(true)
        trackCommit()
        if (route.includes("PUT")) {
          setDocumentedAllEndpointDiffs(true);
        }
        // 1 - button is offset
        setMessage({
          message: `Awesome! Now that you've committed changes, let's take a look at the documentation!`,
          action: {
            text: "See Documentation",
            href: `/demos/todo/documentation/paths/${route}`,
          }
        })
        break
      }
      case "Viewing Endpoint Diff" : {
        // setAction(null)
        // Optic has detected a new field — priority, meaning that there was a change in behavior. Optic detected this, and will now
        // help you update the specification.
        // — onclick —
        // Optic has documented this field — hit approve to save
        // on approve (1/2)
        // Optic has noticed that this field is sometimes ommited. We should tell Optic that it is an optional field.
        // — onclick —
        // Optic has noted that priority is optional! — hit approve to save
        // setMessage(`Optic detected a change from the previously documented behavior. We can update the documentation and commit that change in behavior to the specification. Let's add priority as a field. Then, make it optional.`)
        break
      }
      case "Demo - Previewing Suggestion": {
        let m = ""
        const addingField = eventProps.suggestion.match(/Add field '(.*)' as/)
        const optionalField = eventProps.suggestion.match(/Make field '(.*)' optional/)
        const removeField = eventProps.suggestion.match(/Remove field '(.*)'/)
        const changeField = eventProps.suggestion.match(/Change field '(.*)'/)
        
        if (addingField !== null) {
          m = `Look! Optic updated the spec to add the field ${addingField.pop()}`
        } else if (optionalField !== null) {
          m = `Look! Optic updated the spec to show the ${optionalField.pop()} field is optional`
        } else if (removeField !== null) {
          m = `Look! Optic updated the spec to show the ${removeField.pop()} field is no longer part of the spec`
        } else if (changeField !== null && changeField.length > 2) {
          m = `Look! Optic updated the spec to show the ${changeField[1]} field is now called ${changeField[2]}`
        }
        if (m !== "") {
          setMessage({
            message: `${m}. Press "Approve" to save`,
          })
        }
        break;
      }
      case "Showing recommendation": {
        let m = ""
        const missingField = eventProps.suggestion.match(/Missing (.*) field (.*)/)
        const newField = eventProps.suggestion.match(/New field (.*)/)
        
        if (missingField !== null) {
          m = `Optic has detected an optional field in your API: ${missingField.pop()}. No need to manually update your spec, just click  "Make Optional" and Optic will make the changes for you`
        } else if (newField !== null) {
          m = `Optic has detected a new field in your API: ${newField.pop()}. No need to manually update your spec, just click  "Add Field" and Optic will make the changes for you`
        }

        if (m !== "") {
          setMessage({
            message: m,
          })
        }
        break;
      }
      default: {
        break
      }
    }
  })

  const m = (commits > 1) ? {
    message: "Looks like you've got a hang of things! Feel free to keep poking around",
    action: {
      text: "End Walkthrough",
      onClick: disableTooltips,
    }
  } : message;
  return (
    <>
      <BaseUrlContext value={{ path: match.path, url: match.url }}>
        <DebugSessionContextProvider value={session}>
          <ApiSpecServiceLoader
            captureServiceFactory={captureServiceFactory}
            diffServiceFactory={diffServiceFactory}
          >
            <ApiRoutes getDefaultRoute={(options) => options.diffsRoot} />
            
            <Snackbar open={showTooltips && m.message !== "nothing"} autoHideDuration={6000}>

              <Alert className={styles.alert} severity="info" icon={false}>
                <div className={styles.wrapper}>
                  <div className={styles.message}>
                  {m.message.split("\n").map((item, key) => {
                    return <span key={key}>{item}<br/></span>
                  })}
                  </div>

                  <div className={styles.buttonWrapper}>
                { m.action && <ColorButton className={styles.ctaButton} color="cta" variant="contained" onClick={() => {
                  if (m.action.onClick) {
                    m.action.onClick();
                  } else {
                    history.push(m.action.href)
                  }
                }}>{m.action.text}</ColorButton>}
                </div>
                </div>

                
                
              </Alert>
            </Snackbar>
          </ApiSpecServiceLoader>
        </DebugSessionContextProvider>
      </BaseUrlContext>
    </>
  );
}
