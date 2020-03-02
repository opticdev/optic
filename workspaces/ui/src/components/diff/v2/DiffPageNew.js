import React, {useState} from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {AppBar, Button, Typography} from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import {ArrowDownwardSharp, Cancel, Check} from '@material-ui/icons';
import compose from 'lodash.compose';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {DocGrid} from '../../requests/DocGrid';
import {EndpointsContextStore, withEndpointsContext} from '../../../contexts/EndpointContext';
import {
  TrafficSessionContext,
  TrafficSessionStore,
  withTrafficSessionContext
} from '../../../contexts/TrafficSessionContext';
import {withSpecServiceContext} from '../../../contexts/SpecServiceContext';
import {DiffContextStore, withDiffContext} from './DiffContext';
import {withRfcContext} from '../../../contexts/RfcContext';
import LinearProgress from '@material-ui/core/LinearProgress';
import {BodyUtilities, ContentTypeHelpers, opticEngine} from '@useoptic/domain';
import DiffViewer from './DiffViewer';
import {ExampleOnly, ExampleShapeViewer} from '../../requests/DocCodeBox';
import {HighlightedIDsStore} from '../../shapes/HighlightedIDs';
import niceTry from 'nice-try';
import {NamerStore} from '../../shapes/Namer';
import SimulatedCommandContext from '../SimulatedCommandContext';
import Paper from '@material-ui/core/Paper';
import {DocDarkGrey, DocGrey} from '../../requests/DocConstants';

const {diff, JsonHelper} = opticEngine.com.useoptic;
const {helpers} = diff;
const jsonHelper = JsonHelper();

const styles = theme => ({
  root: {
    maxWidth: '90%',
    paddingTop: 15,
    margin: '0 auto',
    paddingBottom: 120
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100vh'
  },
  scroll: {
    overflow: 'scroll',
    paddingBottom: 300,
    paddingTop: 20,
  },
  rightRegion: {
    paddingTop: 15,
  },
  appBar: {
    borderBottom: '1px solid #e2e2e2',
    backgroundColor: 'white'
  },
});

class DiffPageNew extends React.Component {
  render() {

    const {classes, specStore} = this.props;
    const {pathId, method, sessionId} = this.props.match.params;

    return (
      <CaptureSessionInlineContext specStore={specStore} sessionId={sessionId}>
        <EndpointsContextStore pathId={pathId} method={method} inContextOfDiff={true}>
          <DiffPageContent/>
        </EndpointsContextStore>
      </CaptureSessionInlineContext>
    );
  }
}


class _DiffPageContent extends React.Component {
  render() {
    const {endpointDescriptor, classes, regions, currentExample, acceptedSuggestions} = this.props;
    const {fullPath, httpMethod, endpointPurpose, requestBodies, pathParameters, responses, selectedInterpretation} = endpointDescriptor;


    const RequestBodyRegion = () => {
      const example = currentExample && niceTry(() => jsonHelper.toJs(BodyUtilities.parseJsonBody(currentExample.request.body)));
      const requestContentTypes = jsonHelper.seqToJsArray(regions.requestContentTypes)
      const diffs = jsonHelper.seqToJsArray(regions.inRequest)


      const requestContentTypesToRender = Array.from(
        new Set([...requestContentTypes,
          ...requestBodies
          .filter(i => !!i.requestBody.httpContentType)
          .map(i => i.requestBody.httpContentType)])
        )
        .sort((a, b) => a - b);

      return (
        <DocGrid
          style={{marginBottom: 40}}
          left={(
            <div>
              <DiffViewer regionName={'request-body'} nameOverride={'Request Body Diff'} groupDiffs={diffs}/>
            </div>
          )} right={(
          <div className={classes.rightRegion}>
            {(requestContentTypesToRender.length === 0 && example) && (
              <ExampleOnly
                title={`Observed Request Body`}
                contentType={ContentTypeHelpers.contentTypeOrNull(currentExample.request)}
                //this isn't safe, only works for JSON bodies
                example={example}/>
            )}
            {requestContentTypesToRender.map(contentType => {
              const request = requestBodies.find(i => i.requestBody.httpContentType === contentType)
              if (request) {
                const showExample = currentExample && ContentTypeHelpers.contentTypeOrNull(currentExample.request) === contentType
                return (
                  <div>
                    <ExampleShapeViewer
                      title={`Request Body`}
                      shapeId={request.requestBody.shapeId}
                      contentType={request.requestBody.httpContentType}
                      showShapesFirst={true}
                      example={showExample ? example : undefined}/>
                  </div>
                );
              }
            })}
          </div>
        )}/>
      );
    };

    const ResponseBodyRegion = ({statusCode}) => {

      const diffs = jsonHelper.seqToJsArray(regions.inResponseWithStatusCode(statusCode))

      const contentTypes = responses.filter(i => i.statusCode === statusCode && !!i.responseBody.httpContentType)
      console.log('xxA', contentTypes)


      const showExample = currentExample && currentExample.response.statusCode === statusCode;


      return (
        <DocGrid
          style={{marginBottom: 40}}
          left={(
            <div>
              <DiffViewer nameOverride={`${statusCode} Response Diff`} groupDiffs={diffs}/>
            </div>
          )} right={(<div className={classes.rightRegion}>
          {(contentTypes.length === 0 && showExample) && (
            <ExampleOnly
              title={`Observed ${statusCode} Response Body`}
              contentType={ContentTypeHelpers.contentTypeOrNull(currentExample.response)}
              //this isn't safe, only works for JSON bodies
              example={niceTry(() => jsonHelper.toJs(BodyUtilities.parseJsonBody(currentExample.response.body)))}/>
          )}
          {contentTypes.map(response => {
            const hasBody = response.responseBody.shapeId && !response.responseBody.isRemoved;
            if (hasBody) {
              const contentType = response.responseBody.httpContentType;
              const example = currentExample && niceTry(() => jsonHelper.toJs(BodyUtilities.parseJsonBody(currentExample.response.body)));
              return (
                <ExampleShapeViewer
                  title={`${statusCode} Response Body`}
                  shapeId={response.responseBody.shapeId}
                  contentType={contentType}
                  showShapesFirst={true}
                  example={example}/>
              );
            }
          })}
        </div>)}
        />
      );
    };

    const responseRegions = jsonHelper.seqToJsArray(regions.statusCodes)
    const responsesToRender = Array.from(new Set([...responseRegions, ...responses.map(i => i.statusCode)])).sort((a, b) => a - b);

    return (
      <div className={classes.container}>
        <AppBar position="static" color="default" className={classes.appBar} elevation={0}>
          <Toolbar variant="dense">
            <Typography variant="h6">Review Endpoint Diff</Typography>
            <BatchActionsMenu/>
            <div style={{flex: 1}}/>
            <div>
              <Typography variant="caption" style={{fontSize: 10, color: '#a4a4a4', marginRight: 15}}>Accepted ({acceptedSuggestions.length})
                Suggestions</Typography>
              <Button startIcon={<Check/>} color="secondary">Finish</Button>
            </div>
          </Toolbar>
        </AppBar>

        <div className={classes.scroll}>
          <div className={classes.root}>
            <HighlightedIDsStore>
              <NamerStore disable={true}>
                <RequestBodyRegion/>
                {responsesToRender.map(responseStatusCode => <ResponseBodyRegion statusCode={responseStatusCode}/>)}
              </NamerStore>
            </HighlightedIDsStore>
          </div>
        </div>
      </div>
    );
  }
}

const DiffPageContent = compose(withStyles(styles), withDiffContext, withEndpointsContext)(_DiffPageContent);

export const SuggestionsContext = React.createContext(null);

function SuggestionsStore({children}) {
  const [suggestionToPreview, setSuggestionToPreview] = React.useState(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = React.useState([]);
  const [acceptedSuggestionsWithDiff, setAcceptedSuggestionsWithDiff] = React.useState([]);

  const addAcceptedSuggestion = (suggestion, diff) => setAcceptedSuggestionsWithDiff([...acceptedSuggestionsWithDiff, {
    suggestion,
    diff
  }]);

  const context = {
    suggestionToPreview,
    setSuggestionToPreview,
    acceptedSuggestions,
    setAcceptedSuggestions,
    acceptedSuggestionsWithDiff,
    addAcceptedSuggestion
  };
  return (
    <SuggestionsContext.Provider value={context}>
      {children}
    </SuggestionsContext.Provider>
  );
}

function flatten(acc, array) {
  return [...acc, ...array];
}

const InnerDiffWrapper = withTrafficSessionContext(withRfcContext(function InnerDiffWrapperBase(props) {
  const {eventStore, rfcService, rfcId} = props;
  const {isLoading, session} = props;
  const {children} = props;
  const {setSuggestionToPreview, setAcceptedSuggestions, acceptedSuggestions, suggestionToPreview, addAcceptedSuggestion} = props;

  if (isLoading) {
    return <LinearProgress/>;
  }

  const rfcState = rfcService.currentState(rfcId);

  const samples = jsonHelper.jsArrayToSeq(session.samples.map(i => jsonHelper.fromInteraction(i)));
  const diffResults = helpers.DiffHelpers().groupByDiffs(rfcState, samples);
  const diffHelper = helpers.DiffResultHelpers(diffResults);
  const regions = diffHelper.listRegions()

  const getInteractionsForDiff = (diff) => jsonHelper.seqToJsArray(diffHelper.get(diff));

  const interpreter = diff.interactions.interpreters.DefaultInterpreters(rfcState);
  const getDiffDescription = (x, interaction) => diff.interactions.interpreters.DiffDescriptionInterpreters(rfcState).interpret(x, interaction);

  const interpretationsForDiffAndInteraction = (diff, interaction) => {
    return jsonHelper.seqToJsArray(interpreter.interpret(diff, interaction));
  };
  const simulatedCommands = suggestionToPreview ? jsonHelper.seqToJsArray(suggestionToPreview.commands) : [];

  global.opticDebug.diffContext = {
    samples,
    diffResults,
    acceptedSuggestions,
    suggestionToPreview,
    regions,
    getInteractionsForDiff,
    interpreter,
    interpretationsForDiffAndInteraction,
    simulatedCommands,
    eventStore,
    rfcState
  };

  return (
    <DiffContextStore
      regions={regions}
      setSuggestionToPreview={setSuggestionToPreview}
      acceptSuggestion={(suggestion, diff) => {
        if (suggestion) {
          setAcceptedSuggestions([...acceptedSuggestions, suggestion]);
          addAcceptedSuggestion(suggestion, diff)
        }
      }}
      interpretationsForDiffAndInteraction={interpretationsForDiffAndInteraction}
      getInteractionsForDiff={getInteractionsForDiff}
      getDiffDescription={getDiffDescription}
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
      children
    } = this.props;
    return (
      //@todo refactor sessionId to captureId
      <TrafficSessionStore
        sessionId={sessionId}
        specService={specService}
        renderNoSession={<div>No Capture</div>}>
        <SuggestionsStore>
          <SuggestionsContext.Consumer>
            {(suggestionsContext) => {
              const {
                suggestionToPreview,
                setSuggestionToPreview,
                acceptedSuggestions,
                setAcceptedSuggestions,
                addAcceptedSuggestion,
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
                    suggestionToPreview={suggestionToPreview}
                    setSuggestionToPreview={setSuggestionToPreview}
                    acceptedSuggestions={acceptedSuggestions}
                    setAcceptedSuggestions={setAcceptedSuggestions}
                    addAcceptedSuggestion={addAcceptedSuggestion}
                  >{children}</InnerDiffWrapper>
                </SimulatedCommandContext>
              );
            }}
          </SuggestionsContext.Consumer>

        </SuggestionsStore>
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
      <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} anchorOrigin={{vertical: 'bottom'}}
            onClose={() => setAnchorEl(null)}>
        <MenuItem>Accept all Suggestions</MenuItem>
        <MenuItem>Ignore all Diffs</MenuItem>
        <MenuItem>Reset</MenuItem>
      </Menu>
    </>
  );

}

export default compose(withStyles(styles), withSpecServiceContext)(DiffPageNew);
