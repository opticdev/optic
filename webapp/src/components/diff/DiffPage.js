import React from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import CssBaseline from '@material-ui/core/CssBaseline';
import {AppBar, Typography} from '@material-ui/core';
import {DocDarkGrey, DocGrey, methodColors} from '../requests/DocConstants';
import {ExampleOnly, ShapeOnly} from '../requests/DocCodeBox';
import {DocSubGroup} from '../requests/DocSubGroup';
import {STATUS_CODES} from 'http';
import PropTypes from 'prop-types';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import Tooltip from '@material-ui/core/Tooltip';
import ClearIcon from '@material-ui/icons/Clear';
import InterpretationInfo from './InterpretationInfo';
import {AddedGreen, Highlight, HighlightedIDsStore} from '../shapes/HighlightedIDs';
import {withRfcContext} from '../../contexts/RfcContext';
import {JsonHelper} from '../../engine';
import Mustache from 'mustache';
import {Link} from 'react-router-dom';
import {withNavigationContext} from '../../contexts/NavigationContext';
import {PURPOSE} from '../../ContributionKeys';
import compose from 'lodash.compose';
import {DiffDocGrid} from '../requests/DocGrid';
import {getNormalizedBodyDescriptor} from '../../utilities/RequestUtilities';
import Fab from '@material-ui/core/Fab';
import FastForwardIcon from '@material-ui/icons/FastForward';
import NavigationIcon from '@material-ui/icons/Navigation';
import BugReportIcon from '@material-ui/icons/BugReport';
import ReportBug from './ReportBug';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100vh'
  },
  specContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    paddingRight: 20,
    paddingBottom: 350,
    overflow: 'scroll'
  },
  requestContainer: {
    // display: 'flex',
    // flexDirection: 'column',
    // height: '100vh',
    paddingRight: 20,
    paddingBottom: 350,
    overflow: 'scroll'
  },
  skipContainer: {
    display: 'flex',
    flexDirection: 'row'
  },
  remaining: {
    paddingLeft: 12,
    paddingRight: 12,
    color: DocDarkGrey,
  },
  marginPath: {
    marginTop: theme.spacing(1),
    marginLeft: 2
  },
  button: {
    margin: theme.spacing(1),
  },
  appBar: {
    borderBottom: '1px solid #e2e2e2',
    backgroundColor: 'white'
  },
  scroll: {
    overflow: 'scroll',
    paddingBottom: 300,
    paddingTop: 20,
  },
  fabs: {
    width: '50%',
    textAlign: 'center',
    position: 'fixed',
    bottom: 22,
    paddingRight: 30
  },
  fab: {
    margin: theme.spacing(1)
  }
});

const DiffPath = withStyles(styles)(({classes, path, method, url}) => {

  return (
    <DiffDocGrid
      left={(
        <DocSubGroup title="URL">
          <div className={classes.marginPath}>
            <Typography variant="body" component="span" style={{
              fontWeight: 600,
              color: methodColors[method.toUpperCase()]
            }}>{method.toUpperCase()}</Typography>
            <Typography variant="body" component="span" style={{marginLeft: 9, color: DocGrey}}>{url}</Typography>
          </div>
        </DocSubGroup>
      )}
      right={(
        <DocSubGroup title="Path">
          <div className={classes.marginPath}>
            <Typography variant="body" component="span" style={{
              fontWeight: 600,
              color: methodColors[method.toUpperCase()]
            }}>{method.toUpperCase()}</Typography>
            <Typography variant="body" component="span" style={{marginLeft: 9, color: DocGrey}}>{path}</Typography>
          </div>
        </DocSubGroup>
      )}
    />
  );
});

const DiffRequest = withStyles(styles)(({
                                          classes,
                                          observedRequestBody,
                                          observedContentType,
                                          requestBody = {},
                                          interpretation,
                                          diff
                                        }) => {

  const {shapeId, httpContentType} = requestBody;

  if (typeof observedRequestBody === 'undefined' && !shapeId) {
    return null;
  }

  const opacity = (!diff && !interpretation) ? .6 : 1;

  return (
    <DiffDocGrid
      style={{opacity}}
      left={(
        <DocSubGroup title="Observed Request Body">
          {diff}
          <ExampleOnly title="Example" contentType={observedContentType} example={observedRequestBody}/>
        </DocSubGroup>
      )}
      right={shapeId && (
        <DocSubGroup title="Request Body">
          {interpretation}
          <ShapeOnly title="Shape" shapeId={shapeId} contentType={httpContentType}/>
        </DocSubGroup>
      )}
    />
  );
});


const DiffResponse = withStyles(styles)(({
                                           classes,
                                           statusCode,
                                           observedResponseBody,
                                           observedContentType,
                                           response,
                                           responseBody = {},
                                           diff,
                                           interpretation
                                         }) => {

  const {shapeId, httpContentType} = responseBody;

  const opacity = (!diff && !interpretation) ? .6 : 1;

  return (
    <DiffDocGrid
      style={{opacity}}
      left={(
        <DocSubGroup title={`Response Status: ${statusCode}`}>
          {diff}
          <ExampleOnly title="Response Body" contentType={observedContentType} example={observedResponseBody}/>
        </DocSubGroup>
      )}
      right={response && (
        <DocSubGroup title={<Highlight id={response.responseId}
                                       style={{color: AddedGreen}}>{`${statusCode} - ${STATUS_CODES[statusCode]} Response`}</Highlight>}>
          {interpretation}
          {shapeId && <ShapeOnly title="Response Body Shape" shapeId={shapeId}
                                 contentType={httpContentType}/>
          }
        </DocSubGroup>
      )}
    />
  );
});

class DiffPage extends React.Component {

  getSpecForRequest(observedStatusCode) {
    const {cachedQueryResults, requestId} = this.props;
    const {requests, responses} = cachedQueryResults;
    const request = requests[requestId];
    const {requestDescriptor} = request;
    const {bodyDescriptor} = requestDescriptor;

    const purpose = cachedQueryResults.contributions.getOrUndefined(requestId, PURPOSE);

    const requestBody = getNormalizedBodyDescriptor(bodyDescriptor);

    const response = Object.values(responses)
      .find(({responseDescriptor}) =>
        responseDescriptor.requestId === requestId &&
        responseDescriptor.httpStatusCode === observedStatusCode);

    const responseBody = response && getNormalizedBodyDescriptor(response.responseDescriptor.bodyDescriptor);

    return {
      purpose,
      requestBody,
      response,
      responseBody
    };

  }

  getInterpretationCard(displayContext) {
    const {interpretation, interpretationsLength, interpretationsIndex, setInterpretationIndex, applyCommands, queries} = this.props;

    const {contextJs: context, commands, actionTitle, descriptionJs: description, metadataJs} = interpretation;

    const descriptionProcessed = (() => {
      const {template, fieldId, shapeId} = description;

      const inputs = {};

      if (fieldId) {
        const shapeStructure = queries.nameForFieldId(fieldId);
        const name = shapeStructure.map(({name}) => name).join(' ');
        inputs['fieldId_SHAPE'] = name;
      } else if (shapeId) {
        const shapeStructure = queries.nameForShapeId(shapeId);
        const name = shapeStructure.map(({name}) => name).join(' ');
        inputs['shapeId_SHAPE'] = name;
      }
      return Mustache.render(template, inputs);
    })();

    const color = (metadataJs.addedIds.length > 0 && 'green') || (metadataJs.changedIds.length > 0 && 'yellow') || 'blue';

    const card = (
      <InterpretationInfo
        color={color}
        title={actionTitle}
        metadata={metadataJs}
        description={descriptionProcessed}
        {...{interpretationsLength, interpretationsIndex, setInterpretationIndex}}
        onAccept={() => {
          const c = JsonHelper.seqToJsArray(commands);
          applyCommands(...c)(metadataJs.addedIds, metadataJs.changedIds);
        }}
      />

    );

    if (context.responseId && displayContext === 'response') {
      return card;
    } else if (context.inRequestBody && displayContext === 'request') {
      return card;
    } else {
      return null;
    }
  }

  getDiffCard(displayContext) {
    const {interpretation, diff} = this.props;

    const {contextJs: context} = interpretation;

    if (context.responseId && displayContext === 'response') {
      return diff;

    } else if (context.inRequestBody && displayContext === 'request') {
      return diff;
    } else {
      return null;
    }
  }

  handleDiscard = () => {
    this.props.onDiscard();
  };

  render() {
    const {classes, url, method, path, observed, onSkip, baseUrl, remainingInteractions} = this.props;

    const {requestBody, responseBody, response, purpose} = this.getSpecForRequest(observed.statusCode);

    const {metadataJs} = this.props.interpretation;
    const {addedIds, changedIds} = metadataJs;

    return (
      <div className={classes.root}>
        <CssBaseline/>
        <HighlightedIDsStore addedIds={addedIds} changedIds={changedIds}>
          <AppBar position="static" color="default" className={classes.appBar} elevation={0}>
            <Toolbar variant="dense">
              <div style={{marginRight: 20}}>
                <Link to={baseUrl}>
                  <Tooltip title="End Review">
                    <IconButton size="small" aria-label="delete" className={classes.margin} color="primary"
                                disableRipple
                                onClick={this.handleDiscard}>
                      <ClearIcon fontSize="small"/>
                    </IconButton>
                  </Tooltip>
                </Link>
              </div>
              <div>
                <Typography variant="h6" color="primary">Review API Diff -- {purpose}</Typography>
              </div>
              <div style={{flex: 1}}/>

            </Toolbar>
          </AppBar>


          <div className={classes.scroll}>

            <DiffDocGrid left={(
              <div className={classes.skipContainer}>
                <Typography variant="h4" color="primary">Diff Observed</Typography>
                <div style={{flex: 1}}/>
                <div style={{marginTop: -4}}>
                  <ReportBug classes={classes}/>
                  <Button endIcon={<FastForwardIcon fontSize="small"/>} color="primary" size="small" onClick={onSkip}
                          className={classes.fab}>
                    Skip
                  </Button>
                </div>
              </div>
            )}
                         right={<Typography variant="h4" color="primary">Spec Change</Typography>}/>

            <DiffPath path={path} method={method} url={url}/>

            <DiffRequest observedRequestBody={observed.requestBody}
                         observedContentType={observed.requestContentType}
                         requestBody={requestBody}
                         diff={this.getDiffCard('request')}
                         interpretation={this.getInterpretationCard('request')}
            />

            <DiffResponse statusCode={observed.statusCode}
                          observedResponseBody={observed.responseBody}
                          observedContentType={observed.responseContentType}
                          response={response}
                          responseBody={responseBody}
                          diff={this.getDiffCard('response')}
                          interpretation={this.getInterpretationCard('response')}
            />


          </div>
          {/*<InterpretationCard/>*/}
        </HighlightedIDsStore>
      </div>
    );
  }
}


DiffPage.propTypes = {
  url: PropTypes.string,
  path: PropTypes.string,
  method: PropTypes.string,

  //observation
  observed: PropTypes.shape({
    statusCode: PropTypes.number,
    requestBody: PropTypes.any,
    responseBody: PropTypes.any,
  }),

  remainingInteractions: PropTypes.number
};

export default compose(
  withNavigationContext,
  withRfcContext,
  withStyles(styles)
)(DiffPage);
