import React, { useContext } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { Typography } from '@material-ui/core';
import compose from 'lodash.compose';
import {
  EndpointsContextStore,
  withEndpointsContext,
} from '../../../contexts/EndpointContext';
import {
  SpecServiceContext,
  useServices,
  withSpecServiceContext,
} from '../../../contexts/SpecServiceContext';
import { DiffContext, DiffContextStore, withDiffContext } from './DiffContext';
import { RfcContext, withRfcContext } from '../../../contexts/RfcContext';
import {
  DiffResultHelper,
  Facade,
  opticEngine,
  RfcCommandContext,
} from '@useoptic/domain';
import SimulatedCommandContext from '../SimulatedCommandContext';
import { primary } from '../../../theme';
import uuidv4 from 'uuid/v4';
import { Redirect, withRouter } from 'react-router-dom';
import { NewRegions } from './DiffPreview';
import { CommitCard } from './CommitCard';
import { StableHasher } from '../../../utilities/CoverageUtilities';
import DiffReviewExpanded from './DiffReviewExpanded';
import { DocDivider } from '../../docs/DocConstants';
import { PathAndMethod } from './PathAndMethod';
import { useBaseUrl } from '../../../contexts/BaseUrlContext';
import { usePageTitle } from '../../Page';
import { track } from '../../../Analytics';
import {
  CaptureContextStore,
  useCaptureContext,
} from '../../../contexts/CaptureContext';
import { DiffLoading } from './LoadingNextDiff';
import { DiffCursor } from './DiffCursor';

const { diff, JsonHelper } = opticEngine.com.useoptic;
const { helpers } = diff;
const jsonHelper = JsonHelper();

const styles = (theme) => ({
  root: {
    // maxWidth: '90%',
    paddingTop: 15,
    // margin: '0 auto',
    alignItems: 'center',
    paddingBottom: 120,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1, // grow to fill the entire page
  },
  middle: {
    maxWidth: theme.breakpoints.values.lg,
    flex: 1,
    padding: theme.spacing(3, 0, 3 * 6),
  },
  scroll: {},
  topContainer: {
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
  },
  rightRegion: {
    paddingTop: 15,
  },
  avatar: {
    backgroundColor: primary,
  },
  appBar: {
    borderBottom: '1px solid #e2e2e2',
    backgroundColor: 'white',
  },
  spacer: {
    marginTop: 90,
  },
});

function DiffPageNew(props) {
  const { specStore } = useContext(SpecServiceContext);
  const baseUrl = useBaseUrl();
  const services = useServices();

  const { pathId, method, captureId } = props.match.params;

  return (
    <CaptureSessionInlineContext
      specStore={specStore}
      captureId={captureId}
      pathId={pathId}
      method={method}
      services={services}
    >
      <EndpointsContextStore
        pathId={pathId}
        method={method}
        inContextOfDiff={true}
        notFound={<Redirect to={`${baseUrl}/diffs`} />}
      >
        <DiffPageContent captureId={captureId} />
      </EndpointsContextStore>
    </CaptureSessionInlineContext>
  );
}

function withSpecContext(eventStore, rfcId, clientId, clientSessionId) {
  return {
    applyCommands(commands) {
      try {
        const batchId = uuidv4();
        const commandContext = new RfcCommandContext(
          clientId,
          clientSessionId,
          batchId
        );
        Facade.fromCommands(eventStore, rfcId, commands, commandContext);
      } catch (e) {
        console.error(e);
        debugger;
      }
    },
  };
}

function _DiffPageContent(props) {
  const {
    history,
    endpointDescriptor,
    classes,
    initialEventStore,
    rfcId,
    acceptedSuggestions,
    acceptSuggestion,
    selectedDiff,
    setSelectedDiff,
    diffsForThisEndpoint,
    completed,
    clientId,
    clientSessionId,
    reset,
    specService,
    captureId,
  } = props;

  const {
    fullPath,
    httpMethod,
    endpointPurpose,
    requestBodies,
    pathParameters,
    responses,
    isEmpty,
  } = endpointDescriptor;

  function handleDiscard() {
    //@GOTCHA this resets ignored state as well
    reset();
  }

  const baseUrl = useBaseUrl();
  usePageTitle(
    `Diff Review for ${endpointDescriptor.httpMethod} ${endpointDescriptor.fullPath}`
  );

  async function handleApply(message = 'EMPTY MESSAGE') {
    track('Committed Changes to Endpoint', {
      endpointPurpose,
      message,
      suggestions: acceptedSuggestions.length,
    });
    const newEventStore = initialEventStore.getCopy(rfcId);
    const {
      StartBatchCommit,
      EndBatchCommit,
    } = opticEngine.com.useoptic.contexts.rfc.Commands;
    const batchId = uuidv4();
    const specContext = withSpecContext(
      newEventStore,
      rfcId,
      clientId,
      clientSessionId
    );
    specContext.applyCommands(
      jsonHelper.jsArrayToVector([StartBatchCommit(batchId, message)])
    );
    acceptedSuggestions.forEach((suggestion) => {
      specContext.applyCommands(jsonHelper.seqToVector(suggestion.commands));
    });
    specContext.applyCommands(
      jsonHelper.jsArrayToVector([EndBatchCommit(batchId)])
    );
    await specService.saveEvents(newEventStore, rfcId);
    history.push(`${baseUrl}/diffs/${captureId}`);
  }

  const newRegions = jsonHelper.seqToJsArray(
    DiffResultHelper.newRegionDiffs(diffsForThisEndpoint)
  );

  const bodyDiffs = jsonHelper.seqToJsArray(
    DiffResultHelper.bodyDiffs(diffsForThisEndpoint)
  );

  const hasNewRegions = newRegions.length > 0;
  const diffCount = DiffResultHelper.diffCount(diffsForThisEndpoint);
  const interactionsWithDiffsCount = DiffResultHelper.interactionsWithDiffsCount(
    diffsForThisEndpoint
  );

  const diffContext = useContext(DiffContext);

  const showLoader =
    newRegions.length === 0 && bodyDiffs.length === 0 && !completed;

  return (
    <IgnoreDiffContext.Consumer>
      {({ ignoreDiff, ignoredDiffs }) => (
        <div className={classes.container}>
          <div className={classes.middle}>
            <div style={{ flex: 1, padding: 0, marginBottom: 55 }}>
              <Typography variant="overline" color="textSecondary">
                Reviewing Diff For:
              </Typography>
              <Typography variant="h6">{endpointPurpose}</Typography>
              <PathAndMethod method={httpMethod} path={fullPath} />
            </div>

            <DiffLoading show={showLoader} />

            {hasNewRegions && (
              <NewRegions
                ignoreDiff={ignoreDiff}
                endpointPurpose={endpointPurpose || 'Endpoint Purpose'}
                method={httpMethod}
                fullPath={fullPath}
                newRegions={newRegions}
              />
            )}

            {!hasNewRegions && (
              <>
                <DiffCursor
                  diffs={bodyDiffs}
                  setSelectedDiff={setSelectedDiff}
                  selectedDiff={selectedDiff}
                  completed={completed}
                />
                {selectedDiff && <DiffReviewExpanded diff={selectedDiff} />}
              </>
            )}

            {/*/!*<ShapeDiffRegion*!/*/}
            {/*/!*  region={endpointDiffManger.diffRegions.requestRegions}*!/*/}
            {/*/!*  title="Request Body Diffs"/>*!/*/}

            {/*/!*<ShapeDiffRegion*!/*/}
            {/*/!*  region={endpointDiffManger.diffRegions.responseRegions}*!/*/}
            {/*/!*  title="Response Body Diffs"/>*!/*/}

            {diffCount !== 0 && (
              <DocDivider style={{ marginTop: 60, marginBottom: 60 }} />
            )}

            <CommitCard
              acceptedSuggestions={acceptedSuggestions}
              ignoredDiffs={ignoredDiffs}
              diffCount={diffCount}
              interactionsWithDiffsCount={interactionsWithDiffsCount}
              endpointPurpose={endpointPurpose || 'Endpoint Purpose'}
              method={httpMethod}
              fullPath={fullPath}
              reset={handleDiscard}
              apply={handleApply}
            />
          </div>
        </div>
      )}
    </IgnoreDiffContext.Consumer>
  );
}

const DiffPageContent = compose(
  withStyles(styles),
  withDiffContext,
  withEndpointsContext,
  withSpecServiceContext,
  withRfcContext,
  withRouter
)(_DiffPageContent);

export const SuggestionsContext = React.createContext(null);

function SuggestionsStore({ children }) {
  const [suggestionToPreview, setSuggestionToPreview] = React.useState(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = React.useState([]);

  const resetAccepted = () => {
    setAcceptedSuggestions([]);
  };

  const context = {
    suggestionToPreview,
    setSuggestionToPreview,
    acceptedSuggestions,
    setAcceptedSuggestions,
    resetAccepted,
  };
  return (
    <SuggestionsContext.Provider value={context}>
      {children}
    </SuggestionsContext.Provider>
  );
}

export const IgnoreDiffContext = React.createContext(null);

export function IgnoreDiffStore({ children }) {
  const [ignoredDiffs, setIgnoredDiffs] = React.useState([]);

  const ignoreDiff = (...diffs) => {
    setIgnoredDiffs([...ignoredDiffs, ...diffs]);
  };
  const resetIgnored = () => setIgnoredDiffs([]);

  const context = {
    ignoreDiff,
    ignoredDiffs,
    resetIgnored,
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

const InnerDiffWrapper = function (props) {
  const { isLoading, session } = props;
  const { children } = props;
  const {
    endpointDiffs,
    updatedAdditionalCommands,
    diffId,
    completed,
  } = useCaptureContext();
  const {
    setSuggestionToPreview,
    setAcceptedSuggestions,
    setSelectedDiff,
    acceptedSuggestions,
    suggestionToPreview,
    ignoredDiffs,
    resetIgnored,
    resetAccepted,
    pathId,
    method,
  } = props;

  if (isLoading) {
    return null;
  }

  const simulatedCommands = suggestionToPreview
    ? jsonHelper.seqToJsArray(suggestionToPreview.commands)
    : [];

  const diffsForThisEndpoint = DiffResultHelper.diffsForPathAndMethod(
    jsonHelper.jsArrayToSeq(endpointDiffs),
    pathId,
    method,
    jsonHelper.jsArrayToSeq(ignoredDiffs)
  );

  // global.opticDebug.diffContext = {
  //   samples: session ? session.samples : [],
  //   samplesSeq: jsonHelper.jsArrayToSeq(
  //     (session ? session.samples : []).map((x) =>
  //       jsonHelper.fromInteraction(x)
  //     )
  //   ),
  //   // diffResults,
  //   acceptedSuggestions,
  //   suggestionToPreview,
  //   // regions,
  //   // getInteractionsForDiff,
  //   // interpreter,
  //   // interpretationsForDiffAndInteraction,
  //   simulatedCommands,
  //   eventStore,
  //   initialEventStore,
  //   rfcState,
  //   opticEngine,
  //   StableHasher,
  // };
  /*
const converter = new opticDebug.diffContext.opticEngine.com.useoptic.CoverageReportConverter(opticDebug.diffContext.StableHasher)
const report = opticDebug.diffContext.opticEngine.com.useoptic.diff.helpers.CoverageHelpers().getCoverage(opticDebug.diffContext.rfcState, opticDebug.diffContext.samples)
converter.toJs(report)
 */

  return (
    <DiffContextStore
      diffId={diffId}
      diffsForThisEndpoint={diffsForThisEndpoint}
      setSuggestionToPreview={setSuggestionToPreview}
      completed={completed}
      reset={() => {
        updatedAdditionalCommands([]);
        resetIgnored();
        resetAccepted();
      }}
      acceptSuggestion={(...suggestions) => {
        if (suggestions) {
          const updatedSuggestions = [...acceptedSuggestions, ...suggestions];
          setAcceptedSuggestions(updatedSuggestions);
          setSuggestionToPreview(null);
          const simulatedCommands = updatedSuggestions
            .map((x) => jsonHelper.seqToJsArray(x.commands))
            .reduce(flatten, []);
          updatedAdditionalCommands(simulatedCommands);
        }
      }}
      acceptedSuggestions={acceptedSuggestions}
    >
      {children}
    </DiffContextStore>
  );
  // })
};

class _CaptureSessionInlineContext extends React.Component {
  render() {
    const jsonHelper = JsonHelper();
    const {
      captureId,
      services,
      rfcId,
      eventStore,
      children,
      pathId,
      method,
    } = this.props;
    return (
      //@todo refactor sessionId to captureId
      <SuggestionsStore>
        <IgnoreDiffContext.Consumer>
          {({ ignoredDiffs, resetIgnored }) => (
            <SuggestionsContext.Consumer>
              {(suggestionsContext) => {
                const {
                  suggestionToPreview,
                  setSuggestionToPreview,
                  acceptedSuggestions,
                  setAcceptedSuggestions,
                  resetAccepted,
                } = suggestionsContext;
                const simulatedCommands = acceptedSuggestions
                  .map((x) => jsonHelper.seqToJsArray(x.commands))
                  .reduce(flatten, []);
                return (
                  <SimulatedCommandContext
                    rfcId={rfcId}
                    eventStore={eventStore.getCopy(rfcId)}
                    commands={simulatedCommands}
                    shouldSimulate={true}
                  >
                    <CaptureContextStore
                      captureId={captureId}
                      pathId={pathId}
                      method={method}
                      {...services}
                    >
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
                      >
                        {children}
                      </InnerDiffWrapper>
                    </CaptureContextStore>
                  </SimulatedCommandContext>
                );
              }}
            </SuggestionsContext.Consumer>
          )}
        </IgnoreDiffContext.Consumer>
      </SuggestionsStore>
    );
  }
}

const CaptureSessionInlineContext = compose(withRfcContext)(
  _CaptureSessionInlineContext
);

export default compose(withStyles(styles), withSpecServiceContext)(DiffPageNew);
