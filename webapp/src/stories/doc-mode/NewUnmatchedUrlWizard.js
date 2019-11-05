import React from 'react';
import Button from '@material-ui/core/Button';
import {cleanupPathComponentName, pathStringToPathComponents} from '../../components/path-editor/PathInput';
import pathToRegexp from 'path-to-regexp';
import {RequestsHelper, RequestsCommands} from '../../engine';
import Typography from '@material-ui/core/Typography';
import {withEditorContext} from '../../contexts/EditorContext';
import {withStyles} from '@material-ui/styles';
import {withRfcContext} from '../../contexts/RfcContext';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import {resolvePath} from '../../components/requests/NewRequestStepper';
import PathMatcher from '../../components/diff/PathMatcher';
import {AppBar, TextField} from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/core/SvgIcon/SvgIcon';
import {DiffDocGrid} from './DocGrid';
import {DisplayPath} from './DisplayPath';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Paper from '@material-ui/core/Paper';
import {DocDarkGrey, DocGrey} from './DocConstants';
import {LightTooltip} from '../../components/diff/DiffCard';
import ListSubheader from '@material-ui/core/ListSubheader';
import {Show} from './Show';
import {HeadingContribution, MarkdownContribution} from './DocContribution';
import {withTrafficAndDiffSessionContext} from '../../contexts/TrafficAndDiffSessionContext';
import DiffInfo from './DiffInfo';
import {HighlightedIDsStore} from './shape/HighlightedIDs';
import {EndpointOverviewCodeBox, ExampleOnly} from './DocCodeBox';
import {DocSubGroup} from './DocSubGroup';

function completePathMatcherRegex(pathComponents) {
  const pathString = pathComponentsToString(pathComponents);
  const regex = pathToRegexp(pathString, [], {start: true, end: true});
  return regex;
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
    targetUrl: null,
    previewSample: null,
  };
  handleChange = ({pathExpression}) => {
    this.setState({
      pathExpression
    });
  };

  setPreviewSample = (previewSample) => () => this.setState({previewSample});
  setPurpose = (purpose) => this.setState({purpose});

  selectTarget = (targetUrl) => () => this.setState({targetUrl});

  handleAddPath = () => {
    const pathId = this.props.handleAddPath(this.state.pathExpression);
    this.setState({pathId});
  };

  handleAddRequest = () => {
    const requestId = this.props.handleAddRequest(
      this.state.pathId,
      this.state.previewSample.request.method
    );
  };

  render() {
    const {classes, unmatchedPaths} = this.props;
    const {pathExpression, targetUrl, previewSample, pathId, purpose} = this.state;
    const regex = completePathMatcherRegex(pathStringToPathComponents(pathExpression));
    const isCompleteMatch = regex.exec(targetUrl);
    // const urls = [...new Set(items.map(x => x.sample.request.url))]
    //              .filter(i => i !== url);
    const pathsToRender = unmatchedPaths.reduce((acc, item) => {
      if (acc.find(i => i.method === item.sample.request.method && i.url === item.sample.request.url)) {
        return acc;
      } else {
        return acc.concat({
          method: item.sample.request.method,
          url: item.sample.request.url,
          sample: item.sample
        });
      }
    }, []);

    const matchingUrls = new Set(pathsToRender.filter(({url}) => regex.exec(url)));

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


    function getSteps() {
      return [
        <>Choose a url to document <span className={classes.displayTargetUrl}>{targetUrl}</span></>,
        'Add path to your API spec',
        'Document Request'];
    }

    const getStepContent = (step) => {
      switch (step) {
        case 0:
          return (<>
            Optic observed traffic to the following URLs. Click a URL to begin documenting an API request.
            <List dense>
              {!targetUrl && (
                pathsToRender.map(({method, url, sample}) => (
                  <ListItem button onClick={this.selectTarget(url)} onMouseEnter={this.setPreviewSample(sample)}>
                    <DisplayPath method={method} url={url}/>
                  </ListItem>
                ))
              )}
            </List>
          </>);
        case 1:
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

              <Show when={matchingUrls.size}>
                <List style={{marginTop: 11}}>
                  <ListSubheader> <Typography variant="body1">The path you provided also matches these
                    URLs:</Typography> </ListSubheader>
                  {[...matchingUrls].map(({url, method}) => {
                    return (
                      <ListItem><DisplayPath method={method} url={url}/></ListItem>
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
                placeholder="What does this request do?"
                label="Send this request when you want to"
                value={purpose}
                onChange={(e) => this.setPurpose(e.target.value)}
              />

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

        <Stepper activeStep={activeStep} orientation="vertical">
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

    const right = (
      <>
        <Typography variant="h4" color="primary">Observed</Typography>
        <PreviewSample sample={previewSample}/>
      </>
    );

    return (
      <div className={classes.root}>
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
        <DocSubGroup title={`${statusCode} Response`}>
          <HighlightedIDsStore>
            <ExampleOnly title="Response Body" contentType="application/json" example={responseBody}/>
          </HighlightedIDsStore>
        </DocSubGroup>
      )}
    </>
  );

};

const UnmatchedUrlWizard = withEditorContext(withStyles(styles)(UnmatchedUrlWizardWithoutQuery));

export const UrlsX = withTrafficAndDiffSessionContext(withRfcContext((props) => {
  const {diffStateProjections, cachedQueryResults, handleCommands} = props;
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

  const handleAddRequest = (parentPathId, httpMethod) => {
    const requestId = RequestsHelper.newRequestId();
    const commands = [
      RequestsCommands.AddRequest(requestId, parentPathId, httpMethod)
    ];

    handleCommands(...commands);
    return requestId;
  };

  return (
    <UnmatchedUrlWizard
      unmatchedPaths={sampleItemsWithoutResolvedPaths}
      handleAddPath={handleAddPath}
      handleAddRequest={handleAddRequest}
    />
  );
}));
