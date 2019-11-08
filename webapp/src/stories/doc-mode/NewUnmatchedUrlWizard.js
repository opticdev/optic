import React from 'react';
import Button from '@material-ui/core/Button';
import {cleanupPathComponentName, pathStringToPathComponents} from '../../components/path-editor/PathInput';
import pathToRegexp from 'path-to-regexp';
import {RequestsHelper, RequestsCommands, RfcCommands} from '../../engine';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/styles';
import {withRfcContext} from '../../contexts/RfcContext';
import Tooltip from '@material-ui/core/Tooltip';
import {STATUS_CODES} from 'http';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import {resolvePath} from '../../components/requests/NewRequestStepper';
import PathMatcher from '../../components/diff/PathMatcher';
import {AppBar, CssBaseline, ListItemAvatar, ListItemSecondaryAction, ListItemText, TextField} from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/core/SvgIcon/SvgIcon';
import {DiffDocGrid} from './DocGrid';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Paper from '@material-ui/core/Paper';
import {DocDarkGrey, DocGrey, methodColors} from './DocConstants';
import {LightTooltip} from '../../components/diff/DiffCard';
import ListSubheader from '@material-ui/core/ListSubheader';
import {Show} from './Show';
import sortby from 'lodash.sortby';
import {withTrafficAndDiffSessionContext} from '../../contexts/TrafficAndDiffSessionContext';
import {HighlightedIDsStore} from './shape/HighlightedIDs';
import {EndpointOverviewCodeBox, ExampleOnly} from './DocCodeBox';
import {DocSubGroup} from './DocSubGroup';
import Chip from '@material-ui/core/Chip';
import {PathIdToPathString} from './PathIdToPathString';
import {withNavigationContext} from '../../contexts/NavigationContext';
import compose from 'lodash.compose';
import {PURPOSE} from './ContributionKeys';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    height: '100vh'
  },
  displayTargetUrl: {
    fontWeight: 100,
    color: DocDarkGrey
  },
  bgHeader: {
    backgroundColor: 'rgb(250, 250, 250)'
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

class UnmatchedUrlWizardWithoutQuery extends React.Component {
  state = {
    pathExpression: '',
    purpose: '',
    pathId: null,
    targetUrl: '',
    previewSample: null,
  };
  handleChange = ({pathExpression}) => {
    this.setState({
      pathExpression
    });
  };

  reset = () => {
    this.setState({
      pathExpression: '',
      purpose: '',
      pathId: null,
      targetUrl: '',
      previewSample: null,
    });
  };

  setPreviewSample = (previewSample) => () => this.setState({previewSample});
  setPurpose = (purpose) => this.setState({purpose});

  selectTarget = (targetUrl) => () => this.setState({targetUrl});
  quickAdd = (pathId) => () => this.setState({pathId});

  handleAddPath = () => {
    const pathId = this.props.handleAddPath(this.state.pathExpression);
    this.setState({pathId});
  };

  handleAddRequest = () => {
    const {sessionId} = this.props;
    const {pathId, purpose, previewSample} = this.state;
    const requestId = this.props.handleAddRequest(
      pathId,
      previewSample.request.method,
      purpose
    );
    return this.props.pushRelative(`/diff/${sessionId}/requests/${requestId}`);
  };

  render() {
    const {classes, unmatchedPaths, matchedPaths} = this.props;
    const {pathExpression, targetUrl, previewSample, pathId, purpose} = this.state;
    const regex = completePathMatcherRegex(pathStringToPathComponents(pathExpression));
    const isCompleteMatch = regex.exec(targetUrl);
    const pathsToRender = sortby(unmatchedPaths.reduce(pathReducer, []), ['url', 'method']);
    const suggestedPaths = sortby(matchedPaths.filter(i => !i.requestId).reduce(pathReducer, []), ['url', 'method']);

    const matchingUrls = new Set([...pathsToRender, ...suggestedPaths].filter(({url}) => regex.exec(url)));

    const addPathButton = (
      <Button
        onClick={this.handleAddPath}
        variant="contained"
        color="primary"
        disabled={!isCompleteMatch}>Add Path</Button>
    );

    const addRequestButton = (
      <Button
        onClick={this.handleAddRequest}
        variant="contained"
        color="primary"
        disabled={!purpose}>Finish Documenting Request</Button>
    );

    const withTooltip = (
      <LightTooltip title={'To continue the path you provide must be able to match the observed URL'}>
        <span>{addPathButton}</span>
      </LightTooltip>
    );


    const getSteps = () => {
      return [
        <span onClick={this.reset} style={{cursor: 'pointer'}}>Choose a url to document <span
          className={classes.displayTargetUrl}>{targetUrl}</span></span>,
        'Add path to your API spec',
        'Document Request'];
    };

    const getStepContent = (step) => {
      switch (step) {
        case 0:
          return (<>
            Optic observed traffic to the following URLs. Click a URL to begin documenting an API request.

            {suggestedPaths && (
              <>
                <Typography variant="body1" color="primary" style={{marginTop: 12}}>Suggested Paths to Document</Typography>
                <List dense>
                  {!targetUrl && (
                    suggestedPaths.map(({method, url, sample, pathId}) => {

                      const full = <PathIdToPathString pathId={pathId}/>;

                      return (<UrlListItem url={url}
                                           method={method}
                                           sample={sample}
                                           previewSample={previewSample}
                                           pathId={pathId}
                                           full={full}
                                           quickAdd={this.quickAdd}
                                           selectTarget={this.selectTarget}
                                           setPreviewSample={this.setPreviewSample}
                      />);
                    })
                  )}
                </List>
              </>
            )}

            <Typography variant="body1" color="primary">Observed Paths</Typography>
            <List dense>
              {!targetUrl && (
                pathsToRender.map(({method, url, sample}) => (
                  <UrlListItem url={url}
                               method={method}
                               sample={sample}
                               previewSample={previewSample}
                               selectTarget={this.selectTarget}
                               setPreviewSample={this.setPreviewSample}
                  />))
              )}
            </List>
          </>);
        case 1:
          const matching = [...matchingUrls];
          return (
            <>
              <PathMatcher
                initialPathString={pathExpression}
                url={targetUrl}
                onChange={this.handleChange}
              />

              <div style={{marginTop: 17, paddingTop: 4, textAlign: 'right'}}>
                {!isCompleteMatch ? withTooltip : addPathButton}
              </div>

              <Show when={matching.length && isCompleteMatch}>
                <List style={{marginTop: 11, width: '100%'}}>
                  <ListSubheader className={classes.bgHeader}> <Typography variant="body1">The path you provided also
                    matches these
                    URLs:</Typography> </ListSubheader>
                  {matching
                    .map(({url, method}) => {
                      //don't show self
                      if (url === previewSample.request.url && method === previewSample.request.method) {
                        return null;
                      }
                      return (
                        <UrlListItem url={url} method={method} disableButton/>
                      );
                    })}
                </List>
              </Show>
            </>
          );
        case 2:
          return (
            <div>
              <TextField
                autoFocus
                fullWidth
                placeholder="Send this request when you want to"
                label="What does this request do?"
                value={purpose}
                onChange={(e) => this.setPurpose(e.target.value)}
              />

              {previewSample && <EndpointOverviewCodeBox title={purpose || 'Send this request when you want to...'}
                                                         method={previewSample.request.method}
                                                         url={<PathIdToPathString pathId={pathId}/>}/>}

              <div style={{marginTop: 17, paddingTop: 4, textAlign: 'right'}}>
                {addRequestButton}
              </div>
            </div>
          );
        default:
          return 'Unknown step';
      }
    };

    const steps = getSteps();
    const activeStep = pathId ? 2 : targetUrl ? 1 : 0;

    const left = (
      <>
        <Typography variant="h4" color="primary">Document a New Request</Typography>

        <Stepper activeStep={activeStep} orientation="vertical" style={{backgroundColor: 'transparent'}}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Typography>{getStepContent(index)}</Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} className={classes.resetContainer}>
            <Typography>All steps completed - you&apos;re finished</Typography>

          </Paper>
        )}
      </>
    );

    const right = <PreviewSample sample={previewSample}/>;

    return (
      <div className={classes.root}>
        <CssBaseline/>
        <AppBar position="static" color="default" className={classes.appBar} elevation={0}>
          <Toolbar variant="dense">
            <div style={{marginRight: 20}}>
              <Tooltip title="End Review">
                <IconButton size="small" aria-label="delete" className={classes.margin} color="primary" disableRipple>
                  <ClearIcon fontSize="small"/>
                </IconButton>
              </Tooltip>
            </div>
          </Toolbar>
        </AppBar>
        <div className={classes.scroll}>

          <DiffDocGrid left={left}
                       right={right}/>

        </div>
      </div>
    );
  }
}

const PreviewSample = ({sample}) => {

  if (!sample) {
    return null;
  }

  const {url, method, body: requestBody} = sample.request;
  const {statusCode, body: responseBody} = sample.response;
  return (
    <>
      <Typography variant="h4" color="primary">Observed</Typography>
      <DocSubGroup title="URL">
        <EndpointOverviewCodeBox method={method} url={url}/>
      </DocSubGroup>

      {requestBody && (
        <DocSubGroup title="Request Body">
          <HighlightedIDsStore>
            <ExampleOnly title="Request Body" contentType="application/json" example={requestBody}/>
          </HighlightedIDsStore>
        </DocSubGroup>
      )}
      {responseBody && (
        <DocSubGroup title={`${statusCode} - ${STATUS_CODES[statusCode]}`}>
          <HighlightedIDsStore>
            <ExampleOnly title="Response Body" contentType="application/json" example={responseBody}/>
          </HighlightedIDsStore>
        </DocSubGroup>
      )}
    </>
  );

};

const UnmatchedUrlWizard = compose(
  withStyles(styles),
  withNavigationContext,
)(UnmatchedUrlWizardWithoutQuery);

function UrlListItem(props) {
  const {
    previewSample,
    method,
    url,
    sample,
    full,
    pathId,
    disableButton,
    quickAdd = () => () => {
    },
    selectTarget = () => () => {
    },
    setPreviewSample = () => () => {
    }
  } = props;

  const isSuggested = !!pathId;

  return (
    <ListItem button={!isSuggested && !disableButton}
              onClick={!isSuggested && selectTarget(url)}
              selected={previewSample && previewSample.request.url === url && previewSample.request.method === method}
              onMouseEnter={setPreviewSample(sample)}>
      <ListItemAvatar>
        <Chip size="small" label={method} variant="outlined"
              style={{
                backgroundColor: '#3d4256',
                width: 70,
                textAlign: 'center',
                color: methodColors[method.toUpperCase()],
                fontWeight: 800
              }}/>
      </ListItemAvatar>
      <ListItemText primary={full || url} component="div" primaryTypographyProps={{style: {paddingLeft: 10}}}/>
      {isSuggested && (
        <ListItemSecondaryAction>
          <Button color="primary"
                  onMouseEnter={setPreviewSample(sample)}
                  variant="contained" size="small"
                  onClick={quickAdd(pathId)}>+ Quick Add</Button>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}

function completePathMatcherRegex(pathComponents) {
  const pathString = pathComponentsToString(pathComponents);
  const regex = pathToRegexp(pathString, [], {start: true, end: true});
  return regex;
}

function pathReducer(acc, item) {
  if (acc.find(i => i.method === item.sample.request.method && i.url === item.sample.request.url)) {
    return acc;
  } else {
    return acc.concat({
      method: item.sample.request.method,
      url: item.sample.request.url,
      pathId: item.pathId,
      requestId: item.requestId,
      sample: item.sample
    });
  }
}

export function pathComponentsToString(pathComponents) {
  if (pathComponents.length === 0) {
    return '/';
  }
  const s = '/' + pathComponents
    .map(({name, isParameter}) => {
      if (isParameter) {
        const stripped = name
          .replace('{', '')
          .replace('}', '')
          .replace(':', '');
        return `:${stripped}`;
      } else {
        return name;
      }
    }).join('/');
  return s;
}


export const UrlsX = compose(withTrafficAndDiffSessionContext, withRfcContext)(props => {
  const {diffStateProjections, cachedQueryResults, handleCommands} = props;
  const {sessionId} = props;
  const {sampleItemsWithResolvedPaths, sampleItemsWithoutResolvedPaths} = diffStateProjections;

  const handleAddPath = (pathExpression) => {
    const {pathsById} = cachedQueryResults;

    const pathComponents = pathStringToPathComponents(pathExpression);
    const {toAdd, lastMatch} = resolvePath(pathComponents, pathsById);
    let lastParentPathId = lastMatch.pathId;
    const commands = [];
    toAdd.forEach((addition) => {
      const pathId = RequestsHelper.newPathId();
      const command = (addition.isParameter ? RequestsCommands.AddPathParameter : RequestsCommands.AddPathComponent)(
        pathId,
        lastParentPathId,
        cleanupPathComponentName(addition.name)
      );
      commands.push(command);
      lastParentPathId = pathId;
    });

    handleCommands(...commands);
    return lastParentPathId;
  };

  const handleAddRequest = (parentPathId, httpMethod, purpose) => {
    const requestId = RequestsHelper.newRequestId();
    const commands = [
      RequestsCommands.AddRequest(requestId, parentPathId, httpMethod),
      RfcCommands.AddContribution(requestId, PURPOSE, purpose),
    ];

    handleCommands(...commands);
    return requestId;
  };

  return (
    <UnmatchedUrlWizard
      sessionId={sessionId}
      unmatchedPaths={sampleItemsWithoutResolvedPaths}
      matchedPaths={sampleItemsWithResolvedPaths}
      handleAddPath={handleAddPath}
      handleAddRequest={handleAddRequest}
    />
  );
});
