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
import {ExampleShapeViewer} from '../../requests/DocCodeBox';
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
        <EndpointsContextStore pathId={pathId} method={method}>
          <DiffPageContent/>
        </EndpointsContextStore>
      </CaptureSessionInlineContext>
    );
  }
}


class _DiffPageContent extends React.Component {
  render() {
    const {endpointDescriptor, classes, regionNames, currentExample} = this.props;
    const {fullPath, httpMethod, endpointPurpose, requestBodies, pathParameters, responses, selectedInterpretation} = endpointDescriptor;


    const responseRegionRegex = /response-body-([0-9]{3})/;

    const responseRegions = regionNames.map(i => {
      const match = responseRegionRegex.exec(i);
      if (match) {
        return parseInt(match[1]);
      }
    }).filter(i => !!i);

    const responsesToRender = Array.from(new Set([...responseRegions, ...responses.map(i => i.statusCode)])).sort((a, b) => a - b);

    const RequestBodyRegion = () => {

      const example = currentExample && niceTry(() => JsonHelper.toJs(BodyUtilities.parseJsonBody(currentExample.response.body)));

      return (
        <DocGrid
          style={{marginBottom: 40}}
          left={(
            <div>
              <DiffViewer regionName={'request-body'} nameOverride={'Request Body Diff'}/>
            </div>
          )} right={(
          <div className={classes.rightRegion}>
            {requestBodies.filter(i => {
              if (currentExample && selectedInterpretation) {
                return ContentTypeHelpers.contentTypeOrNull(currentExample.request) === i.requestBody.httpContentType;
              }
              return true;
            }).map(request => {
              return (
                <div>
                  <ExampleShapeViewer
                    title={`Request Body`}
                    shapeId={request.requestBody.shapeId}
                    contentType={request.requestBody.httpContentType}
                    showShapesFirst={true}
                    example={currentExample && example}/>
                </div>
              );
            })}
          </div>
        )}/>
      );
    };

    const ResponseBodyRegion = ({statusCode}) => {

      const showExample = currentExample && currentExample.response.statusCode === statusCode;
      const contentTypes = responses.filter(i => i.statusCode === statusCode);

      return (
        <DocGrid
          style={{marginBottom: 40}}
          left={(
            <div>
              <DiffViewer regionName={`response-body-${statusCode}`} nameOverride={`${statusCode} Response Diff`}/>
            </div>
          )} right={(<div className={classes.rightRegion}>
          {contentTypes.map(response => {
            const hasBody = response.responseBody.shapeId && !response.responseBody.isRemoved;
            if (hasBody) {
              const contentType = response.responseBody.httpContentType;
              const example = currentExample && niceTry(() => JsonHelper.toJs(BodyUtilities.parseJsonBody(currentExample.response.body)));
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


    return (
      <div className={classes.container}>
        <AppBar position="static" color="default" className={classes.appBar} elevation={0}>
          <Toolbar variant="dense">
            <Typography variant="h6">Review Endpoint Diff</Typography>
            <BatchActionsMenu/>
            <div style={{flex: 1}}/>
            <div>
              <Typography variant="caption" style={{fontSize: 10, color: '#a4a4a4', marginRight: 15}}>Accepted (0) Suggestions</Typography>
              <Button startIcon={<Check />} color="secondary">Finish</Button>
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

const SuggestionsContext = React.createContext(null);

function SuggestionsStore({children}) {
  const [suggestionToPreview, setSuggestionToPreview] = React.useState(null);
  const [acceptedSuggestions, setAcceptedSuggestions] = React.useState([]);
  const context = {
    suggestionToPreview,
    setSuggestionToPreview,
    acceptedSuggestions,
    setAcceptedSuggestions
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
  const {setSuggestionToPreview, setAcceptedSuggestions, acceptedSuggestions, suggestionToPreview} = props;

  if (isLoading) {
    return <LinearProgress/>;
  }

  const rfcState = rfcService.currentState(rfcId);

  const samples = jsonHelper.jsArrayToSeq(session.samples.map(i => jsonHelper.fromInteraction(i)));
  const diffResults = helpers.DiffHelpers().groupByDiffs(rfcState, samples);
  const diffHelper = helpers.DiffResultHelpers(diffResults);
  const regions = diffHelper.listRegions();
  const regionNames = jsonHelper.seqToJsArray(regions.keys());

  const getInteractionsForDiff = (diff) => jsonHelper.seqToJsArray(diffHelper.get(diff));
  const getDiffsByRegion = (groupName) => jsonHelper.seqToJsArray(regions.getDiffsByRegion(groupName));

  const interpreter = diff.interactions.interpreters.BasicInterpreters(rfcState);
  const getDiffDescription = (x, interaction) => diff.interactions.interpreters.DiffDescriptionInterpreters(rfcState).interpret(x, interaction);

  const interpretationsForDiffAndInteraction = (diff, interaction) => {
    return jsonHelper.seqToJsArray(interpreter.interpret(diff, interaction));
  };
  const simulatedCommands = suggestionToPreview ? jsonHelper.seqToJsArray(suggestionToPreview.commands) : [];
  return (
    <DiffContextStore
      regionNames={regionNames}
      setSuggestionToPreview={setSuggestionToPreview}
      acceptSuggestion={() => {
        if (suggestionToPreview) {
          setAcceptedSuggestions([...acceptedSuggestions, suggestionToPreview]);
        }
      }}
      getDiffsByRegion={getDiffsByRegion}
      interpretationsForDiffAndInteraction={interpretationsForDiffAndInteraction}
      getInteractionsForDiff={getInteractionsForDiff}
      getDiffDescription={getDiffDescription}
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
                setAcceptedSuggestions
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
