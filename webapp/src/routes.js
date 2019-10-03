import React from 'react';
import {Redirect, Switch, Route} from 'react-router-dom';
import {FocusedRequestStore} from './contexts/FocusedRequestContext.js';
import {InitialRfcCommandsStore} from './contexts/InitialRfcCommandsContext.js';
import {RfcStore, LocalRfcStore, LocalDiffRfcStore} from './contexts/RfcContext.js';
import {PathContext} from './contexts/PathContext.js';
import PathPage from './components/PathPage.js';
import ConceptsPage from './components/ConceptsPage';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Loading from './components/navigation/Loading';
import Welcome from './components/onboarding/Welcome';
import UploadOAS from './components/onboarding/upload-oas';
import {ImportedOASContext, ImportedOASStore} from './contexts/ImportedOASContext';
import OverView from './components/onboarding/Overview';
import {EditorStore} from './contexts/EditorContext';
import {TutorialStore} from './contexts/TutorialContext';
import {SessionStore} from './contexts/SessionContext';
import Button from '@material-ui/core/Button';
import LocalDiffManager from './components/diff/LocalDiffManager';
import {ShapeDialogStore} from './contexts/ShapeDialogContext';

export const routerPaths = {
  newRoot: () => '/new',
  example: () => '/examples/:exampleId',
  apiRoot: (base) => base,
  pathPage: (base) => `${base}/paths/:pathId`,
  conceptPage: (base) => `${base}/concepts/:conceptId`,
  localRoot: () => '/saved',
  localDiff: () => '/saved/diff/:sessionId'
};

export const routerUrls = {
  apiRoot: (base) => base,
  pathPage: (base, pathId) => `${base}/paths/${pathId}`,
  conceptPage: (base, conceptId) => `${base}/concepts/${conceptId}`
};

class ExampleLoader extends React.Component {

  state = {
    example: null,
    error: null
  };

  componentDidMount() {
    fetch(`/example-commands/${this.props.match.params.exampleId}-commands.json`)
      .then(response => {
        if (response.ok) {
          return response.text()
            .then(rawString => {
              if (rawString.startsWith('<!DOCTYPE html>')) {
                this.setState({error: true});
              } else {
                this.setState({
                  example: rawString
                });
              }
            });
        }
      });
  }

  render() {
    const {example, error} = this.state;

    if (error) {
      return (
        <Dialog open={true}>
          <DialogTitle>Example not found</DialogTitle>
          <DialogContent>The example API you are trying to load could not be found.</DialogContent>
          <DialogActions>
            <Button onClick={() => window.location.reload()}>Reload</Button>
            <Button onClick={() => window.location.href = '/new'} color="secondary">Start New API</Button>
          </DialogActions>
        </Dialog>
      );
    }

    if (example === null) {
      return <Loading/>;
    }
    return (
      <InitialRfcCommandsStore initialCommandsString={example} rfcId="testRfcId">
        <RfcStore>
          <TutorialStore>
            <APIEditorRoutes {...this.props} />
          </TutorialStore>
        </RfcStore>
      </InitialRfcCommandsStore>
    );
  }
}

class LocalLoader extends React.Component {

  state = {
    loadedEvents: null,
    error: null
  };

  componentDidMount() {
    fetch(`/cli-api/events`)
      .then(response => {
        if (response.ok) {
          return response.text()
            .then(rawString => {
              if (rawString.startsWith('<!DOCTYPE html>')) {
                this.setState({error: true});
              } else {
                this.setState({
                  loadedEvents: rawString
                });
              }
            });
        }
      });
  }

  render() {
    const {loadedEvents, error} = this.state;

    if (error) {
      return (
        <Dialog open={true}>
          <DialogTitle>Error Loading Saved Spec</DialogTitle>
          <DialogContent>Please reload and, if that does not work, open an issue.</DialogContent>
          <DialogActions>
            <Button onClick={() => window.location.reload()}>Reload</Button>
            <Button href="https://github.com/opticdev/optic/issues/new/choose" color="secondary">Open
              an issue</Button>
          </DialogActions>
        </Dialog>
      );
    }

    if (loadedEvents === null) {
      return <Loading/>;
    }
    return (
      <InitialRfcCommandsStore initialEventsString={loadedEvents} rfcId="testRfcId">
        <Switch>
          <Route path={routerPaths.localDiff()} component={LocalDiff}/>
          <Route render={() => (
            <LocalRfcStore>
              <TutorialStore>
                <APIEditorRoutes {...this.props} />
              </TutorialStore>
            </LocalRfcStore>
          )}/>
        </Switch>

      </InitialRfcCommandsStore>
    );
  }
}


class LocalDiff extends React.Component {
  render() {
    const {sessionId} = this.props.match.params;

    return (
      <LocalDiffRfcStore>
        <SessionStore sessionId={sessionId}>
          <ShapeDialogStore>
            <LocalDiffManager/>
          </ShapeDialogStore>
        </SessionStore>
      </LocalDiffRfcStore>
    );
  }
}

class NewApiLoader extends React.Component {
  render() {
    return (
      <ImportedOASContext.Consumer>
        {({providedCommands}) => (
          <InitialRfcCommandsStore initialCommandsString={providedCommands || '[]'} rfcId="testRfcId">
            <RfcStore>
              <TutorialStore isNew={true}>
                <APIEditorRoutes {...this.props} />
              </TutorialStore>
            </RfcStore>
          </InitialRfcCommandsStore>
        )}
      </ImportedOASContext.Consumer>
    );
  }
}

function PathRoot({match, baseUrl}) {
  const {pathId} = match.params;
  return (
    <PathContext.Provider value={pathId}>
      <PathPage pathId={pathId} baseUrl={baseUrl}/>
    </PathContext.Provider>
  );
}

class APIEditorRoutes extends React.Component {
  render() {

    const {url} = this.props.match;

    const baseUrl = url;

    return (
      <div>
        <EditorStore baseUrl={baseUrl}>
          <FocusedRequestStore>
            <Switch>
              <Route exact path={routerPaths.newRoot(url)} component={OverView}/>
              <Route path={routerPaths.pathPage(url)} component={PathRoot}/>
              <Route path={routerPaths.conceptPage(url)}
                     component={(props) =>
                       <ConceptsPage {...props} conceptId={props.match.params.conceptId}/>
                     }/>
              <Route path={routerPaths.apiRoot(url)} component={OverView}/>
              <Redirect to={routerPaths.apiRoot(url)}/>
            </Switch>
          </FocusedRequestStore>
        </EditorStore>
      </div>
    );
  }
}

class AppRoutes extends React.Component {
  render() {
    //in local mode
    if (process.env.REACT_APP_CLI_MODE) {
      return (
        <div>
          <ImportedOASStore>
            <Switch>
              <Route path={routerPaths.localRoot()} component={LocalLoader}/>
              <Redirect to={routerPaths.localRoot()}/>
            </Switch>
          </ImportedOASStore>
        </div>
      );
    }

    //running on website
    return (
      <div>
        <ImportedOASStore>
          <Switch>
            <Route path={routerPaths.newRoot()} component={NewApiLoader}/>
            <Route path={'/upload-oas'} exact component={UploadOAS}/>
            <Route strict path={routerPaths.example()} component={ExampleLoader}/>
            <Route path={'/'} exact component={Welcome}/>
            <Redirect from={routerPaths.example()} to={routerPaths.example()}/>
            <Redirect to={routerPaths.newRoot()}/>
          </Switch>
        </ImportedOASStore>
      </div>
    );

  }
}

export default AppRoutes;
