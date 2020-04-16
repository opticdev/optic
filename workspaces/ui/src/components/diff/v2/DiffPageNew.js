import React, {useContext} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {Typography} from '@material-ui/core';
import compose from 'lodash.compose';
import {EndpointsContextStore, withEndpointsContext} from '../../../contexts/EndpointContext';
import {withTrafficSessionContext} from '../../../contexts/TrafficSessionContext';
import {SpecServiceContext, withSpecServiceContext} from '../../../contexts/SpecServiceContext';
import {DiffContextStore, withDiffContext} from './DiffContext';
import {withRfcContext} from '../../../contexts/RfcContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import {Facade, opticEngine, RfcCommandContext} from '@useoptic/domain';
import SimulatedCommandContext from '../SimulatedCommandContext';
import {primary} from '../../../theme';
import uuidv4 from 'uuid/v4';
import {Redirect, withRouter} from 'react-router-dom';
import {DiffCursor, NewRegions} from './DiffPreview';
import {CommitCard} from './CommitCard';
import {StableHasher} from '../../../utilities/CoverageUtilities';
import DiffReviewExpanded from './DiffReviewExpanded';
import {DocDivider} from '../../docs/DocConstants';
import {PathAndMethod} from './PathAndMethod';
import {useBaseUrl} from '../../../contexts/BaseUrlContext';

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
    flexGrow: 1, // grow to fill the entire page
    overflow: 'hidden'
  },
  middle: {
    margin: '0 auto',
    maxWidth: 1200,
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

function DiffPageNew(props) {
  const {specStore} = useContext(SpecServiceContext);
  const baseUrl = useBaseUrl();
  const {pathId, method, captureId} = props.match.params;
  return (
    <CaptureSessionInlineContext specStore={specStore} captureId={captureId} pathId={pathId} method={method}>
      <EndpointsContextStore pathId={pathId} method={method} inContextOfDiff={true}
                             notFound={<Redirect to={`${baseUrl}/diffs`}/>}>
        <DiffPageContent captureId={captureId}/>
      </EndpointsContextStore>
    </CaptureSessionInlineContext>
  );
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

function _DiffPageContent(props) {
  const {
    history,
    endpointDescriptor,
    endpointDiffManger,
    classes,
    initialEventStore,
    rfcId,
    acceptedSuggestions,
    acceptSuggestion,
    selectedDiff,
    clientId,
    clientSessionId,
    reset,
    specService,
    captureId,
  } = props;

  const {fullPath, httpMethod, endpointPurpose, requestBodies, pathParameters, responses, isEmpty} = endpointDescriptor;

  function handleDiscard() {
    //@GOTCHA this resets ignored state as well
    reset();
  }

  const baseUrl = useBaseUrl();

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
    history.push(`${baseUrl}/diffs/${captureId}`);
  }

  const diffRegions = endpointDiffManger.diffRegions;

  return (
    <IgnoreDiffContext.Consumer>
      {({ignoreDiff, ignoredDiffs}) => (
        <div className={classes.container}>
          <div className={classes.scroll}>
            <div className={classes.middle}>

              <div style={{flex: 1, padding: 0, marginBottom: 55}}>

                <Typography variant="overline" color="textSecondary">Reviewing Diff For:</Typography>
                <Typography variant="h6">{endpointPurpose}</Typography>
                <PathAndMethod method={httpMethod}
                               path={fullPath}/>

              </div>


              <NewRegions ignoreDiff={ignoreDiff}
                          endpointPurpose={endpointPurpose || 'Endpoint Purpose'}
                          method={httpMethod}
                          fullPath={fullPath}
                          newRegions={diffRegions.newRegions}/>

              <DiffCursor diffs={diffRegions.bodyDiffs}/>

              {selectedDiff && <DiffReviewExpanded diff={selectedDiff}/>}

              {/*<ShapeDiffRegion*/}
              {/*  region={endpointDiffManger.diffRegions.requestRegions}*/}
              {/*  title="Request Body Diffs"/>*/}

              {/*<ShapeDiffRegion*/}
              {/*  region={endpointDiffManger.diffRegions.responseRegions}*/}
              {/*  title="Response Body Diffs"/>*/}


              {endpointDiffManger.diffCount !== 0 && <DocDivider style={{marginTop: 60, marginBottom: 60}}/>}

              <CommitCard acceptedSuggestions={acceptedSuggestions}
                          ignoredDiffs={ignoredDiffs}
                          diffCount={endpointDiffManger.diffCount}
                          interactionsWithDiffsCount={endpointDiffManger.interactionsWithDiffsCount}
                          endpointPurpose={endpointPurpose || 'Endpoint Purpose'}
                          method={httpMethod}
                          fullPath={fullPath}
                          reset={handleDiscard}
                          apply={handleApply}

              />

            </div>
          </div>
        </div>
      )}
    </IgnoreDiffContext.Consumer>
  );
}

const DiffPageContent = compose(
  withStyles(styles),
  withDiffContext, withEndpointsContext,
  withSpecServiceContext, withRfcContext,
  withRouter
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

export function IgnoreDiffStore({children}) {
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

  const simulatedCommands = suggestionToPreview ? jsonHelper.seqToJsArray(suggestionToPreview.commands) : [];

  global.opticDebug.diffContext = {
    samples: session ? session.samples : [],
    samplesSeq: jsonHelper.jsArrayToSeq((session ? session.samples : []).map(x => jsonHelper.fromInteraction(x))),
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
    opticEngine,
    StableHasher
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
      {children}
    </DiffContextStore>
  );
}));


class _CaptureSessionInlineContext extends React.Component {

  render() {
    const jsonHelper = JsonHelper();
    const {
      rfcId,
      eventStore,
      children,
      pathId,
      method
    } = this.props;
    return (
      //@todo refactor sessionId to captureId
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
    );
  }
};

const CaptureSessionInlineContext = compose(withRfcContext)(_CaptureSessionInlineContext);

export default compose(withStyles(styles), withSpecServiceContext)(DiffPageNew);
