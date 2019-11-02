import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import {DocGrid} from './DocGrid';
import {ListItemText, Typography} from '@material-ui/core';
import {DocDivider, DocSubHeading, SubHeadingStyles, SubHeadingTitleColor} from './DocConstants';
import {DocSubGroup} from './DocSubGroup';
import {DocParameter} from './DocParameter';
import {HeadingContribution, MarkdownContribution} from './DocContribution';
import DocCodeBox, {EndpointOverviewCodeBox, ExampleShapeViewer} from './DocCodeBox';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import {DocButton, DocButtonGroup} from './ButtonGroup';
import {secondary} from '../../theme';
import {DocResponse} from './DocResponse';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Collapse from '@material-ui/core/Collapse';
import {DocRequest} from './DocRequest';
import {DocQueryParams} from './DocQueryParams';
import {withRfcContext} from '../../contexts/RfcContext';
import {EditorModes, withEditorContext} from '../../contexts/EditorContext';
import {RequestUtilities} from '../../utilities/RequestUtilities';
import {RequestsCommandHelper} from '../../components/requests/RequestsCommandHelper';
import {getNormalizedBodyDescriptor} from '../../components/PathPage';
import Editor from '../../components/navigation/Editor';
import EndpointOverview from './EndpointOverview';
import {asPathTrail, getNameWithFormattedParameters, isPathParameter} from '../../components/utilities/PathUtilities';
import {updateContribution} from '../../engine/routines';

const styles = theme => ({
  root: {
    paddingTop: 45,
    paddingLeft: 22,
    paddingRight: 22,
    paddingBottom: 200
  },
  wrapper: {
    padding: 22,
    display: 'flex',
    width: '95%',
    marginTop: 22,
    marginBottom: 140,
    flexDirection: 'column',
    height: 'fit-content',
  },
  docButton: {
    paddingLeft: 9,
    borderLeft: '3px solid #e2e2e2',
    marginBottom: 6,
    cursor: 'pointer',
    fontWeight: 500,
  },
});

export const EndpointPageWithQuery = withStyles(styles)(withEditorContext(withRfcContext(({requestId, classes, handleCommand, handleCommands, mode, baseUrl, cachedQueryResults, inDiffMode}) => {

  const {apiName, requests, pathsById, responses, requestIdsByPathId, contributions, requestParameters} = cachedQueryResults;

  const request = requests[requestId];

  const {requestDescriptor, bodyDescriptor} = request;
  const {httpMethod, pathComponentId} = requestDescriptor;

  //Path
  const path = pathsById[pathComponentId];
  const pathTrail = asPathTrail(pathComponentId, pathsById);
  const pathTrailComponents = pathTrail.map(pathId => pathsById[pathId]);
  const pathTrailWithNames = pathTrailComponents.map((pathComponent) => {
    const pathComponentName = getNameWithFormattedParameters(pathComponent);
    const pathComponentId = pathComponent.pathId;
    return {
      pathComponentName,
      pathComponentId
    };
  });

  const fullPath = pathTrailWithNames.map(({pathComponentName}) => pathComponentName)
                                     .join('/')

  const pathParameters = pathTrail
    .map(pathId => pathsById[pathId])
    .filter((p) => isPathParameter(p))
    .map(p => ({pathId: p.pathId, name: p.descriptor.ParameterizedPathComponentDescriptor.name}));

  // Request Body
  const {httpContentType, shapeId, isRemoved} = getNormalizedBodyDescriptor(bodyDescriptor);
  const shouldShowRequestBody = RequestUtilities.hasBody(bodyDescriptor) || (mode === EditorModes.DESIGN && !inDiffMode && RequestUtilities.canAddBody(request));
  const requestCommandsHelper = new RequestsCommandHelper(handleCommands, requestId);

  // Responses
  const responsesForRequest = Object.values(responses)
    .filter((response) => response.responseDescriptor.requestId === requestId);
  const shouldShowResponses = responsesForRequest.length > 0 || (mode === EditorModes.DESIGN && !inDiffMode);

  const parametersForRequest = Object.values(requestParameters)
    .filter((requestParameter) => requestParameter.requestParameterDescriptor.requestId === requestId);

  const headerParameters = parametersForRequest.filter(x => x.requestParameterDescriptor.location === 'header');
  const queryParameters = parametersForRequest.filter(x => x.requestParameterDescriptor.location === 'query');

  return (
    <Editor>
      <div className={classes.wrapper}>
        <EndpointPage
          endpointPurpose={contributions.getOrUndefined(requestId, 'purpose')}
          endpointDescription={contributions.getOrUndefined(requestId, 'description')}
          requestId={requestId}
          updateContribution={(id, key, value) => {
            handleCommand(updateContribution(id, key, value))
          }}
          method={httpMethod}
          url={fullPath}
          parameters={pathParameters}
        />
      </div>
    </Editor>
  );
})));

class _EndpointPage extends React.Component {

  state = {
    showAllResponses: false
  };

  toggleAllResponses = () => this.setState({showAllResponses: true});

  render() {
    const {classes, endpointPurpose, endpointDescription, method, url, parameters = [], updateContribution, requestId} = this.props;

    const endpointOverview = (() => {
      const left = (
        <div>
          <HeadingContribution
            value={endpointPurpose}
            label="What does this endpoint do?"
            onChange={(value) => {
              updateContribution(requestId, 'purpose', value)
            }}
          />
          <div style={{marginTop: -6, marginBottom: 6}}>
            <MarkdownContribution
              value={endpointDescription}
              label="Detailed Description"
              onChange={(value) => {
                updateContribution(requestId, 'description', value)
              }}/>
          </div>

          {parameters.length ? (
            <DocSubGroup title="Path Parameters">
              {parameters.map(i => <DocParameter title={i.name} paramId={i.pathId}/>)}
            </DocSubGroup>
          ) : null}
        </div>
      );

      const right = <EndpointOverviewCodeBox method={method} url={url}/>;

      return <DocGrid left={left} right={right}/>;
    })();

    // const qparams = [{title: 'filter'}, {title: 'count'}, {title: 'id'}];
    //
    // const queryParameters = <DocQueryParams parameters={qparams}
    //                                         example={{
    //                                           filter: '>50',
    //                                           count: 12,
    //                                           id: 'abcdefg'
    //                                         }}
    // />;

    const requestBody = <DocRequest
      description={'Pass along the body to do the thing'}
      fields={[{title: 'fieldA', description: 'does something'}]}
      contentType={'application/json'}
      shapeId={'SHAPE ABC'}
      requestId={requestId}
      updateContribution={updateContribution}
      example={{weAre: 'penn state', state: 'PA'}}
    />;

    const firstResponseBody = <DocResponse
      statusCode={200}
      description={'The thing got deleted'}
      fields={[]}
      contentType={'application/json'}
      shapeId={'SHAPE ABC'}
      example={{weAre: 'penn state', state: 'PA'}}
    />;

    return (
      <div className={classes.root}>
        {endpointOverview}
        {/*{queryParameters}*/}
        {requestBody}
        {firstResponseBody}

        {!this.state.showAllResponses && (
          <DocButtonGroup style={{marginTop: 44}}>
            <DocButton label=" ↓ Show Other Responses"
                       color={secondary}
                       onClick={this.toggleAllResponses}/>
          </DocButtonGroup>)
        }
        <Collapse in={this.state.showAllResponses}>
          <DocResponse
            statusCode={403}
            description={'The thing got deleted'}
            fields={[]}
            contentType={'application/json'}
            shapeId={'SHAPE ABC'}
            example={{weAre: 'penn state', state: 'PA'}}
          />
          <DocResponse
            statusCode={404}
            description={'The thing got deleted'}
            fields={[]}
            contentType={'application/json'}
            shapeId={'SHAPE ABC'}
            example={{weAre: 'penn state', state: 'PA'}}
          />
        </Collapse>
      </div>
    );
  }
}

export const EndpointPage = withStyles(styles)(_EndpointPage);
