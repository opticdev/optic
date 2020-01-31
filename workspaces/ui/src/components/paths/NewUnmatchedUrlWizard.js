import React from 'react';
import Button from '@material-ui/core/Button';
import {cleanupPathComponentName, pathStringToPathComponents} from './PathInput';
import pathToRegexp from 'path-to-regexp';
import {RequestsHelper, RequestsCommands, RfcCommands} from '@useoptic/domain';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/styles';
import {withRfcContext} from '../../contexts/RfcContext';
import Tooltip from '@material-ui/core/Tooltip';
import {STATUS_CODES} from 'http';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import {AppBar, CssBaseline, ListItemAvatar, ListItemSecondaryAction, ListItemText, TextField} from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import {DiffDocGridRightSticky} from '../requests/DocGrid';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import ClearIcon from '@material-ui/icons/Clear';
import Paper from '@material-ui/core/Paper';
import {DocDarkGrey, methodColors} from '../requests/DocConstants';
import ListSubheader from '@material-ui/core/ListSubheader';
import {Show} from '../shared/Show';
import sortby from 'lodash.sortby';
import {withTrafficSessionContext} from '../../contexts/TrafficSessionContext';
import {HighlightedIDsStore} from '../shapes/HighlightedIDs';
import {EndpointOverviewCodeBox, ExampleOnly} from '../requests/DocCodeBox';
import {DocSubGroup} from '../requests/DocSubGroup';
import Chip from '@material-ui/core/Chip';
import {PathIdToPathString} from './PathIdToPathString';
import {withNavigationContext} from '../../contexts/NavigationContext';
import compose from 'lodash.compose';
import {PURPOSE} from '../../ContributionKeys';
import {Link} from 'react-router-dom';
import {track} from '../../Analytics';
import {Helmet} from 'react-helmet';
import {LightTooltip} from '../tooltips/LightTooltip';
import {resolvePath} from '../utilities/PathUtilities';
import PathMatcher from '../diff/PathMatcher';
import {withProductDemoContext} from '../navigation/ProductDemo';
import equal from 'deep-equal';

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
  contentRegion: {
    paddingBottom: 300,
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

  componentDidMount() {
    track('Unmatched_URL_Page.OPENED');
  }

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

  setPreviewSample = (previewSample) => () => {
    if (!this.state.targetUrl) {
      this.setState({previewSample});
    }
  };

  setPurpose = (purpose) => this.setState({purpose});

  selectTarget = (targetUrl) => () => {
    track('Unmatched_URL_Page.SELECT_URL', {targetUrl});
    this.setState({targetUrl});
  };

  quickAdd = (pathId) => () => this.setState({pathId});

  handleAddPath = () => {
    track('Unmatched_URL_Page.ADD_PATH', {targetUrl: this.state.targetUrl, pathExpression: this.state.pathExpression});
    const pathId = this.props.handleAddPath(this.state.pathExpression);
    this.setState({pathId});
  };

  handleAddRequest = async () => {
    const {sessionId} = this.props;
    const {rfcId, eventStore, specService} = this.props;
    const {pathId, purpose, previewSample} = this.state;
    const requestId = this.props.handleAddRequest(
      pathId,
      previewSample.request.method,
      purpose
    );
    await specService.saveEvents(eventStore, rfcId);
    return this.props.pushRelative(`/diff/${sessionId}/requests/${requestId}`);
  };


  render() {
    const {classes, unmatchedPaths, matchedPaths, baseUrl, demos} = this.props;
    const {pathExpression, targetUrl, previewSample, pathId, purpose} = this.state;
    const regex = completePathMatcherRegex(pathStringToPathComponents(pathExpression));
    const isCompleteMatch = true;
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
      <LightTooltip title={'To continue the path you provide must be able to match the observed Path'}>
        <span>{addPathButton}</span>
      </LightTooltip>
    );


    const getSteps = () => {
      return [
        <span onClick={this.reset} style={{cursor: 'pointer'}}>Choose a URL to document <span
          className={classes.displayTargetUrl}>{targetUrl}</span></span>,
        'Add path to your API spec',
        'Document Request'];
    };

    const getStepContent = (step) => {
      switch (step) {
        case 0:
          return (<div id="new-url" key="new-url">
            {suggestedPaths.length > 0 && (
              <>
                <Typography variant="body1" color="primary" style={{marginTop: 12}}>Suggested Paths to
                  Document</Typography>
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
          </div>);
        case 1:
          const matching = [...matchingUrls];
          return (
            <div id="new-url-match" key="new-url-match">
              <PathMatcher
                initialPathString={pathExpression}
                url={targetUrl}
                autoFocus={!isCompleteMatch}
                onChange={this.handleChange}
              />

              <div style={{marginTop: 17, paddingTop: 4, textAlign: 'right'}}>
                {!isCompleteMatch ? withTooltip : addPathButton}
              </div>

              <Show when={matching.length > 1 && isCompleteMatch}>
                <List style={{marginTop: 11, width: '100%'}}>
                  <ListSubheader className={classes.bgHeader}> <Typography variant="body1">The path you provided also
                    matches these
                    Paths:</Typography> </ListSubheader>
                  {matching
                    .map(({url, method}) => {
                      //don't show self
                      if (previewSample && url === previewSample.request.url && method === previewSample.request.method) {
                        return null;
                      }
                      return (
                        <UrlListItem url={url} method={method} disableButton/>
                      );
                    })}
                </List>
              </Show>
            </div>
          );
        case 2:

          localStorage.setItem('new-url-reached-step-3', 'true');

          return (
            <div>
              <TextField
                autoFocus
                fullWidth
                placeholder="Send this request when you want to"
                label="What does this request do?"
                value={purpose}
                onKeyPress={(e) => {
                  if (e.which === 13) {
                    this.handleAddRequest();
                  }
                }}
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
      <div style={{paddingTop: 22, paddingBottom: 150}}>
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
      </div>
    );

    const right = <PreviewSample sample={previewSample}/>;

    return (
      <div className={classes.root}>
        <CssBaseline/>
        <Helmet>
          <title>Document New API Request</title>
        </Helmet>
        {demos.newUrlDemo1 && demos.newUrlDemo1(activeStep === 0)}
        {demos.newUrlDemo2 && demos.newUrlDemo2(activeStep === 1)}
        <AppBar position="static" color="default" className={classes.appBar} elevation={0}>
          <Toolbar variant="dense">
            <div style={{marginRight: 20}}>
              <Tooltip title="End Review">
                <IconButton size="small" aria-label="delete" color="primary" disableRipple component={Link}
                            to={baseUrl}>
                  <ClearIcon fontSize="small" color="primary" style={{color: 'black'}}/>
                </IconButton>
              </Tooltip>
            </div>
          </Toolbar>
        </AppBar>
        <div className={classes.contentRegion}>

          <DiffDocGridRightSticky
            left={left}
            right={right}/>

        </div>
      </div>
    );
  }
}

class PreviewSample extends React.Component {

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    if (equal(nextProps.sample, this.props.sample)) {
      return false
    } else {
      return true
    }
  }

  render() {
    const {sample} = this.props

    if (!sample) {
      return null;
    }
    const {url, method, body: requestBody} = sample.request;
    const {statusCode, body: responseBody} = sample.response;

    return (
      <div style={{paddingTop: 22, paddingBottom: 150}}>
        <Typography variant="h4" color="primary">Observed</Typography>
        <DocSubGroup title="Path">
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
      </div>
    );

  }

};

const UnmatchedUrlWizard = compose(
  withStyles(styles),
  withNavigationContext,
  withTrafficSessionContext,
  withRfcContext,
  withProductDemoContext
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
  const isSelected = previewSample && previewSample.request.url === url && previewSample.request.method === method;
  return (
    <ListItem button={!isSuggested && !disableButton}
              onClick={!isSuggested && selectTarget(url)}
              selected={isSelected}
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
      <ListItemText primary={full || url} component="div"
                    primaryTypographyProps={{style: {paddingLeft: 10, whiteSpace: 'pre'}}}/>
      {isSuggested ? (
        <ListItemSecondaryAction>
          <Button
            color="primary"
            onMouseEnter={setPreviewSample(sample)}
            variant="contained" size="small"
            onClick={quickAdd(pathId)}>+ Quick Add</Button>
        </ListItemSecondaryAction>
      ) : null}
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


export const UrlsX = compose(withTrafficSessionContext, withProductDemoContext, withRfcContext)(props => {
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
