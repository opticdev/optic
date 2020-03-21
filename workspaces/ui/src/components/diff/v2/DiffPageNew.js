import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {AppBar, Button, CardActions, Typography} from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import {ArrowDownwardSharp, Cancel, Check} from '@material-ui/icons';
import compose from 'lodash.compose';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {DiffDocGrid, DocGrid} from '../../requests/DocGrid';
import {EndpointsContextStore, withEndpointsContext} from '../../../contexts/EndpointContext';
import {
  TrafficSessionContext,
  TrafficSessionStore,
  withTrafficSessionContext
} from '../../../contexts/TrafficSessionContext';
import PersonIcon from '@material-ui/icons/Person';
import {withSpecServiceContext} from '../../../contexts/SpecServiceContext';
import {DiffContextStore, withDiffContext} from './DiffContext';
import {withRfcContext} from '../../../contexts/RfcContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import {
  BodyUtilities,
  Facade,
  RfcCommandContext,
  CompareEquality,
  ContentTypeHelpers,
  opticEngine
} from '@useoptic/domain';
import DiffViewer from './DiffViewer';
import niceTry from 'nice-try';
import {NamerStore} from '../../shapes/Namer';
import SimulatedCommandContext from '../SimulatedCommandContext';
import {Dark, DocDarkGrey, DocDivider, DocGrey} from '../../requests/DocConstants';
import Card from '@material-ui/core/Card';
import Avatar from '@material-ui/core/Avatar';
import {primary, secondary} from '../../../theme';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import {Show} from '../../shared/Show';
import BatchLearnDialog from './BatchLearnDialog';
import {DiffShapeViewer, DiffToggleContextStore, URLViewer} from './DiffShapeViewer';
import uuidv4 from 'uuid/v4';
import {withRouter} from 'react-router-dom';
import {routerPaths} from '../../../RouterPaths';
import {withNavigationContext} from '../../../contexts/NavigationContext';
import ContentTabs, {RequestTabsContextStore} from './ContentTabs';
import {DiffRegion} from './Notification';
import DiffDrawer from './DiffDrawer';
import {NewRegions, ShapeDiffRegion} from './DiffPreview';
import {CommitCard} from './CommitCard';

const {diff, JsonHelper} = opticEngine.com.useoptic;
const {helpers} = diff;
const jsonHelper = JsonHelper();

const styles = theme => ({
  root: {
    maxWidth: '90%',
    paddingTop: 15,
    margin: '0 auto',
    alignItems: 'center',
    paddingBottom: 120
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden'
  },
  middle: {
    margin: '0 auto',
    maxWidth: 1200
  },
  scroll: {
    overflow: 'scroll',
    flex: 1,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 300,
    height: '95vh',
    paddingTop: 20,
  },
  topContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1
  },
  rightRegion: {
    paddingTop: 15,
  },
  avatar: {
    backgroundColor: primary,
  },
  appBar: {
    borderBottom: '1px solid #e2e2e2',
    backgroundColor: 'white'
  },
  spacer: {
    marginTop: 90
  }
});

class DiffPageNew extends React.Component {
  render() {

    const {classes, specStore} = this.props;
    const {pathId, method, sessionId} = this.props.match.params;
    return (
      <DiffToggleContextStore>
        <RequestTabsContextStore>
          <CaptureSessionInlineContext specStore={specStore} sessionId={sessionId} pathId={pathId} method={method}>
            <EndpointsContextStore pathId={pathId} method={method} inContextOfDiff={true}>
              <DiffPageContent/>
            </EndpointsContextStore>
          </CaptureSessionInlineContext>
        </RequestTabsContextStore>
      </DiffToggleContextStore>
    );
  }
}

function withSpecContext(eventStore, rfcId, clientId, clientSessionId) {
  return {
    applyCommands(commands) {
      try {
        const batchId = uuidv4();
        const commandContext = new RfcCommandContext(clientId, clientSessionId, batchId);
        Facade.fromCommands(eventStore, rfcId, commands, commandContext);
      } catch (e) {
        console.error(e);
        debugger
      }
    }
  };
}

class _DiffPageContent extends React.Component {
  render() {
    const {
      history, baseUrl,
      endpointDescriptor,
      endpointDiffManger,
      classes,
      initialEventStore,
      rfcId,
      acceptedSuggestions,
      acceptSuggestion,
      clientId,
      clientSessionId,
      reset,
      specService,
    } = this.props;
    const {fullPath, httpMethod, endpointPurpose, requestBodies, pathParameters, responses, isEmpty} = endpointDescriptor;


    function handleDiscard() {
      //@GOTCHA this resets ignored state as well
      reset();
    }

    //
    //
    async function handleApply(message = 'EMPTY MESSAGE') {
      const newEventStore = initialEventStore.getCopy(rfcId);
      const {StartBatchCommit, EndBatchCommit} = opticEngine.com.useoptic.contexts.rfc.Commands;
      const batchId = uuidv4();
      const specContext = withSpecContext(newEventStore, rfcId, clientId, clientSessionId);
      specContext.applyCommands(jsonHelper.jsArrayToVector([StartBatchCommit(batchId, message)]));
      acceptedSuggestions.forEach(suggestion => {
        specContext.applyCommands(jsonHelper.seqToVector(suggestion.commands));
      });
      specContext.applyCommands(jsonHelper.jsArrayToVector([EndBatchCommit(batchId)]));
      console.log(JSON.parse(newEventStore.serializeEvents(rfcId)));
      await specService.saveEvents(newEventStore, rfcId);
      history.push(routerPaths.apiDocumentation(baseUrl));
    }

    return (
      <IgnoreDiffContext.Consumer>
        {({ignoreDiff, ignoredDiffs}) => (
          <div className={classes.container}>
            <AppBar position="static" color="default" className={classes.appBar} elevation={0}>
              <Toolbar variant="dense">
                <Typography variant="h6">Review Endpoint Diff</Typography>
                {/*<BatchActionsMenu reset={reset}/>*/}
                <div style={{flex: 1}}/>
                <div>
                  <Typography variant="caption" style={{fontSize: 10, color: '#a4a4a4', marginRight: 15}}>Accepted
                    {/*({acceptedSuggestions.length})*/}
                    Suggestions</Typography>
                  {/*<Button onClick={() => setIsFinishing(true)} startIcon={<Check/>}*/}
                  {/*        color="secondary">Finish</Button>*/}
                </div>
              </Toolbar>
            </AppBar>

            <div className={classes.topContainer}>
              <div className={classes.scroll}>
                <div className={classes.middle}>

                  <Typography variant="h4" color="primary"
                              style={{marginBottom: 12}}>{endpointPurpose || 'Endpoint Purpose'}</Typography>

                  <NewRegions ignoreDiff={ignoreDiff}
                              regions={endpointDiffManger.diffRegions.newRegions}/>


                  <ShapeDiffRegion
                    region={endpointDiffManger.diffRegions.requestRegions}
                    title="Request Body Diffs"/>

                  <ShapeDiffRegion
                    region={endpointDiffManger.diffRegions.responseRegions}
                    title="Response Body Diffs"/>

                  {endpointDiffManger.noDiff && acceptedSuggestions.length === 0 ?
                    <Typography variant="h6">No more diffs for this endpoint</Typography> : (
                      <>
                        <DocDivider style={{marginTop: 75, marginBottom: 25}}/>
                        <CommitCard acceptedSuggestions={acceptedSuggestions}
                                    ignoredDiffs={ignoredDiffs}
                                    reset={handleDiscard}
                                    apply={handleApply}

                        />
                      </>
                    )}


                </div>
              </div>
            </div>
          </div>
        )}
      </IgnoreDiffContext.Consumer>
    );
  }
}

const DiffPageContent = compose(
  withStyles(styles),
  withDiffContext, withEndpointsContext,
  withSpecServiceContext, withRfcContext,
  withRouter, withNavigationContext
)(_DiffPageContent);

export const SuggestionsContext = React.createContext(null);

function SuggestionsStore({children}) {
  const [suggestionToPreview, setSuggestionToPreview] = React.useState(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = React.useState([]);


  const resetAccepted = () => {
    setAcceptedSuggestions([]);
  };

  console.log('preview it ' + suggestionToPreview);

  const context = {
    suggestionToPreview,
    setSuggestionToPreview,
    acceptedSuggestions,
    setAcceptedSuggestions,
    resetAccepted
  };
  return (
    <SuggestionsContext.Provider value={context}>
      {children}
    </SuggestionsContext.Provider>
  );
}

export const IgnoreDiffContext = React.createContext(null);

function IgnoreDiffStore({children}) {
  const [ignoredDiffs, setIgnoredDiffs] = React.useState([]);

  const ignoreDiff = (...diffs) => {
    setIgnoredDiffs([...ignoredDiffs, ...diffs]);
  };
  const resetIgnored = () => setIgnoredDiffs([]);

  const context = {
    ignoreDiff,
    ignoredDiffs,
    resetIgnored
  };
  return (
    <IgnoreDiffContext.Provider value={context}>
      {children}
    </IgnoreDiffContext.Provider>
  );
}


function flatten(acc, array) {
  return [...acc, ...array];
}

const InnerDiffWrapper = withTrafficSessionContext(withRfcContext(function InnerDiffWrapperBase(props) {
  const {eventStore, initialEventStore, rfcService, rfcId, diffManager, pathId, method} = props;
  const {isLoading, session} = props;
  const {children} = props;
  const {setSuggestionToPreview, setAcceptedSuggestions, acceptedSuggestions, suggestionToPreview, ignoredDiffs, resetIgnored, resetAccepted} = props;

  if (isLoading) {
    return <LinearProgress/>;
  }

  const rfcState = rfcService.currentState(rfcId);

  diffManager.updatedRfcState(rfcState);

  const ignored = jsonHelper.jsArrayToSeq(ignoredDiffs);

  const endpointDiffManger = diffManager.managerForPathAndMethod(pathId, method, ignored);

  // alert(JSON.stringify(session))

  // const samples = jsonHelper.jsArrayToSeq(session.samples.map(i => jsonHelper.fromInteraction(i)));
  // const diffResults = helpers.DiffHelpers().groupByDiffs(rfcState, samples);
  // const diffHelper = helpers.DiffResultHelpers(diffResults);
  // const regions = diffHelper.filterOut(jsonHelper.jsArrayToSeq(ignoredDiffs)).listRegions();

  // const getInteractionsForDiff = (diff) => jsonHelper.seqToJsArray(diffHelper.get(diff));
  //
  // const interpreter = diff.interactions.interpreters.DefaultInterpreters(rfcState);
  // const getDiffDescription = (x, interaction) => diff.interactions.interpreters.DiffDescriptionInterpreters(rfcState).interpret(x, interaction);
  //
  // const interpretationsForDiffAndInteraction = (diff, interaction) => {
  //   return jsonHelper.seqToJsArray(interpreter.interpret(diff, interaction));
  // };
  const simulatedCommands = suggestionToPreview ? jsonHelper.seqToJsArray(suggestionToPreview.commands) : [];

  global.opticDebug.diffContext = {
    // samples,
    // diffResults,
    acceptedSuggestions,
    suggestionToPreview,
    // regions,
    // getInteractionsForDiff,
    // interpreter,
    // interpretationsForDiffAndInteraction,
    simulatedCommands,
    eventStore,
    initialEventStore,
    rfcState,
    opticEngine
  };
  /*
const converter = new opticDebug.diffContext.opticEngine.com.useoptic.CoverageReportConverter(opticDebug.diffContext.StableHasher)
const report = opticDebug.diffContext.opticEngine.com.useoptic.diff.helpers.CoverageHelpers().getCoverage(opticDebug.diffContext.rfcState, opticDebug.diffContext.samples)
converter.toJs(report)
   */

  return (
    <DiffContextStore
      endpointDiffManger={endpointDiffManger}
      setSuggestionToPreview={setSuggestionToPreview}
      reset={() => {
        resetIgnored();
        resetAccepted();
      }}
      acceptSuggestion={(...suggestions) => {
        if (suggestions) {
          setAcceptedSuggestions([...acceptedSuggestions, ...suggestions]);
          setSuggestionToPreview(null);
        }
      }}
      acceptedSuggestions={acceptedSuggestions}
    >
      <SimulatedCommandContext
        rfcId={rfcId}
        eventStore={eventStore.getCopy(rfcId)}
        commands={simulatedCommands}
        shouldSimulate={true}
      >
        {children}
      </SimulatedCommandContext>
    </DiffContextStore>
  );
}));


class _CaptureSessionInlineContext extends React.Component {

  render() {
    const jsonHelper = JsonHelper();
    const {
      rfcId,
      eventStore,
      sessionId,
      specService,
      children,
      pathId,
      method
    } = this.props;
    return (
      //@todo refactor sessionId to captureId
      <TrafficSessionStore
        sessionId={sessionId}
        specService={specService}
        renderNoSession={<div>No Capture</div>}>
        <IgnoreDiffStore>
          <SuggestionsStore>
            <IgnoreDiffContext.Consumer>
              {({ignoredDiffs, resetIgnored}) => (
                <SuggestionsContext.Consumer>
                  {(suggestionsContext) => {
                    const {
                      suggestionToPreview,
                      setSuggestionToPreview,
                      acceptedSuggestions,
                      setAcceptedSuggestions,
                      resetAccepted,
                    } = suggestionsContext;
                    const simulatedCommands = acceptedSuggestions.map(x => jsonHelper.seqToJsArray(x.commands)).reduce(flatten, []);
                    console.log({
                      xxx: 'xxx',
                      suggestionToPreview,
                      acceptedSuggestions
                    });
                    return (
                      <SimulatedCommandContext
                        rfcId={rfcId}
                        eventStore={eventStore.getCopy(rfcId)}
                        commands={simulatedCommands}
                        shouldSimulate={true}>
                        <InnerDiffWrapper
                          pathId={pathId}
                          method={method}
                          ignoredDiffs={ignoredDiffs}
                          resetIgnored={resetIgnored}
                          resetAccepted={resetAccepted}
                          suggestionToPreview={suggestionToPreview}
                          setAcceptedSuggestions={setAcceptedSuggestions}
                          setSuggestionToPreview={setSuggestionToPreview}
                          acceptedSuggestions={acceptedSuggestions}
                        >{children}</InnerDiffWrapper>
                      </SimulatedCommandContext>
                    );
                  }}
                </SuggestionsContext.Consumer>
              )}
            </IgnoreDiffContext.Consumer>

          </SuggestionsStore>
        </IgnoreDiffStore>
      </TrafficSessionStore>
    );
  }
};

const CaptureSessionInlineContext = compose(withRfcContext)(_CaptureSessionInlineContext);

function BatchActionsMenu(props) {

  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <Button
        color="secondary"
        size="small"
        onClick={(e) => setAnchorEl(e.target)}
        style={{marginLeft: 12}}
        endIcon={<ArrowDownwardSharp/>}>
        Batch Actions</Button>
      <Menu open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            anchorOrigin={{vertical: 'bottom'}}
            onClose={() => setAnchorEl(null)}>
        <BatchLearnDialog
          button={(handleClickOpen) => <MenuItem onClick={handleClickOpen}>Accept all
            Suggestions</MenuItem>}/>
        <MenuItem>Ignore all Diffs</MenuItem>
        <MenuItem onClick={() => {
          props.reset();
          setAnchorEl(null);
        }}>Reset</MenuItem>
      </Menu>
    </>
  );

}

export default compose(withStyles(styles), withSpecServiceContext)(DiffPageNew);
