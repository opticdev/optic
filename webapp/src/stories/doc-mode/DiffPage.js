import React, { useRef } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Editor from '../../components/navigation/Editor';
import { DiffDocGrid, DocGrid } from './DocGrid';
import { AppBar, Grid, Typography } from '@material-ui/core';
import { DocDarkGrey, DocGrey, methodColors, SubHeadingStyles } from './DocConstants';
import { HeadingContribution } from './DocContribution';
import { DocCodeBox, EndpointOverviewCodeBox, ExampleOnly, ShapeOnly, ShapeOverview } from './DocCodeBox';
import { DocSubGroup } from './DocSubGroup';
import DiffInfo from './DiffInfo';
import { STATUS_CODES } from 'http';
import InterpretationCard from './InterpretationCard';
import PropTypes from 'prop-types';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import ReplayIcon from '@material-ui/icons/Replay';
import Button from '@material-ui/core/Button';
import FastRewindIcon from '@material-ui/icons/FastRewind';
import Tooltip from '@material-ui/core/Tooltip';
import ClearIcon from '@material-ui/icons/Clear';
import InterpretationInfo from './InterpretationInfo';
import { AddedGreen, Highlight, HighlightedIDsStore } from './shape/HighlightedIDs';
import { withRfcContext } from '../../contexts/RfcContext';
import { getNormalizedBodyDescriptor } from '../../components/PathPage';
import { DiffToDiffCard } from './DiffCopy';
import { commandsToJs, JsonHelper } from '../../engine';
import Mustache from 'mustache';
import { Link } from 'react-router-dom';
import { withNavigationContext } from '../../contexts/NavigationContext';

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
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    paddingRight: 20,
    paddingBottom: 350,
    overflow: 'scroll'
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
  }
});

const DiffPath = withStyles(styles)(({ classes, path, method, url }) => {

  return (
    <DiffDocGrid
      left={(
        <DocSubGroup title="URL">
          <div className={classes.marginPath}>
            <Typography variant="body" component="span" style={{
              fontWeight: 600,
              color: methodColors[method.toUpperCase()]
            }}>{method.toUpperCase()}</Typography>
            <Typography variant="body" component="span" style={{ marginLeft: 9, color: DocGrey }}>{url}</Typography>
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
            <Typography variant="body" component="span" style={{ marginLeft: 9, color: DocGrey }}>{path}</Typography>
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

  const { shapeId, httpContentType } = requestBody;
  const opacity = (!diff && !interpretation) ? .6 : 1;

  return (
    <DiffDocGrid
      style={{ opacity }}
      left={(
        <DocSubGroup title="Observed Request Body">
          {diff}
          <ExampleOnly title="Example" contentType={observedContentType} example={observedRequestBody} />
        </DocSubGroup>
      )}
      right={shapeId && (
        <DocSubGroup title="Request Body">
          {interpretation}
          <ShapeOnly title="Shape" shapeId={shapeId} contentType={httpContentType} />
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

  const { shapeId, httpContentType } = responseBody;

  const opacity = (!diff && !interpretation) ? .6 : 1;

  return (
    <DiffDocGrid
      style={{ opacity }}
      left={(
        <DocSubGroup title={`Response Status: ${statusCode}`}>
          {diff}
          <ExampleOnly title="Response Body" contentType={observedContentType} example={observedResponseBody} />
        </DocSubGroup>
      )}
      right={response && (
        <DocSubGroup title={<Highlight id={response.responseId}
          style={{ color: AddedGreen }}>{`${statusCode} - ${STATUS_CODES[statusCode]} Response`}</Highlight>}>
          {interpretation}
          {shapeId && <ShapeOnly title="Response Body Shape" shapeId={shapeId}
            contentType={httpContentType} />
          }
        </DocSubGroup>
      )}
    />
  );
});

const SpecPanel = withStyles(styles)(({ classes }) => {

  return (
    <div className={classes.specContainer}>
      <Typography variant="h4" color="primary">{'Add Pet to User'}</Typography>

      <div>
        <EndpointOverviewCodeBox method={'POST'} url={'/users/:userId/pets'} />
      </div>

      <DocSubGroup title="Request" style={{ marginTop: 22 }}>
        <ShapeOverview title="Shape" />
      </DocSubGroup>

      <DocSubGroup title="200 Response" style={{ marginTop: 22 }}>
        <ShapeOverview title="Shape" />
      </DocSubGroup>

    </div>
  );
});

class DiffPage extends React.Component {

  getSpecForRequest(observedStatusCode) {
    const { cachedQueryResults, requestId } = this.props;
    const { requests, responses } = cachedQueryResults;
    const request = requests[requestId];
    const { requestDescriptor } = request;
    const { httpMethod, pathComponentId, bodyDescriptor } = requestDescriptor;

    const purpose = cachedQueryResults.contributions.getOrUndefined(requestId, 'purpose');

    const requestBody = getNormalizedBodyDescriptor(bodyDescriptor);

    const response = Object.values(responses)
      .find(({ responseDescriptor }) =>
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
    const { interpretation, interpretationsLength, interpretationsIndex, setInterpretationIndex, applyCommands, queries } = this.props;

    const { contextJs: context, commands, actionTitle, descriptionJs: description, metadataJs } = interpretation;

    const descriptionProcessed = (() => {
      const { template, fieldId, shapeId } = description;

      const inputs = {};

      if (fieldId) {
        const shapeStructure = queries.nameForFieldId(fieldId);
        const name = shapeStructure.map(({ name }) => name).join(' ');
        inputs['fieldId_SHAPE'] = name;
      } else if (shapeId) {
        const shapeStructure = queries.nameForShapeId(shapeId);
        const name = shapeStructure.map(({ name }) => name).join(' ');
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
        {...{ interpretationsLength, interpretationsIndex, setInterpretationIndex }}
        onAccept={() => {
          applyCommands(...JsonHelper.seqToJsArray(commands))(metadataJs.addedIds, metadataJs.changedIds);
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
    const { interpretation, diff } = this.props;

    const { contextJs: context } = interpretation;

    if (context.responseId && displayContext === 'response') {
      return diff;

    } else if (context.inRequestBody && displayContext === 'request') {
      return diff;
    } else {
      return null;
    }
  }

  render() {
    const { classes, url, method, path, observed, onSkip, baseUrl, remainingInteractions } = this.props;

    const { requestBody, responseBody, response, purpose } = this.getSpecForRequest(observed.statusCode);


    const { metadataJs } = this.props.interpretation;
    const { addedIds, changedIds } = metadataJs;

    return (
      <div className={classes.root}>
        <HighlightedIDsStore addedIds={addedIds} changedIds={changedIds}>
          <AppBar position="static" color="default" className={classes.appBar} elevation={0}>
            <Toolbar variant="dense">
              <div style={{ marginRight: 20 }}>
                <Link to={baseUrl}>
                  <Tooltip title="End Review">
                    <IconButton size="small" aria-label="delete" className={classes.margin} color="primary"
                      disableRipple>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Link>
              </div>

              <Typography variant="overline" className={classes.remaining}>
                {remainingInteractions} remaining
              </Typography>

              <Tooltip title="Skip Example">
                <IconButton size="small" aria-label="delete" className={classes.margin} color="primary" disableRipple
                  onClick={onSkip}>
                  <SkipNextIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <div style={{ flex: 6.6, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">{purpose}</Typography>
              </div>
              <div style={{ flex: 1 }} />

            </Toolbar>
          </AppBar>


          <div className={classes.scroll}>

            <DiffDocGrid left={<Typography variant="h4" color="primary">Observed</Typography>}
              right={<Typography variant="h4" color="primary">Expected</Typography>} />

            <DiffPath path={path} method={method} url={url} />

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

export default withNavigationContext(withRfcContext(withStyles(styles)(DiffPage)));
