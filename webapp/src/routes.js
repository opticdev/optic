import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';
import { FocusedRequestStore } from './contexts/FocusedRequestContext.js';
import { InitialRfcCommandsStore } from './contexts/InitialRfcCommandsContext.js';
import { RfcStore, LocalRfcStore, LocalDiffRfcStore } from './contexts/RfcContext.js';
import { PathContext } from './contexts/PathContext.js';
import PathPage from './components/PathPage.js';
import ConceptsPage from './components/ConceptsPage';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Loading from './components/navigation/Loading';
import Welcome from './components/onboarding/Welcome';
import UploadOAS from './components/onboarding/upload-oas';
import { ImportedOASContext, ImportedOASStore } from './contexts/ImportedOASContext';
import OverView from './components/onboarding/Overview';
import { EditorStore } from './contexts/EditorContext';
import { TutorialStore } from './contexts/TutorialContext';
import { TrafficAndDiffSessionStore } from './contexts/TrafficAndDiffSessionContext';
import Button from '@material-ui/core/Button';
import LocalDiffManager from './components/diff/LocalDiffManager';
import { ShapeDialogStore } from './contexts/ShapeDialogContext';
import uuidv4 from 'uuid/v4';
import { CommandContextStore } from './contexts/CommandContext.js';
import ExampleCommandsLoader from './components/loaders/ExampleCommandsLoader.js';
import ExampleSessionsLoader from './components/loaders/ExampleSessionsLoader.js';
import { specService } from './services/SpecService.js';

export const routerPaths = {
  newRoot: () => '/new',
  exampleCommands: () => '/examples/:exampleId',
  exampleSessions: () => '/example-sessions/:exampleId',
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


class LocalLoader extends React.Component {

  state = {
    loadedEvents: null,
    error: null,
    clientId: 'anonymous',
    clientSessionId: uuidv4()
  };

  componentDidMount() {
    this.loadCommandContext()
      .then(() => this.loadEvents())
  }

  loadEvents = () => {
    return fetch(`/cli-api/events`)
      .then(response => {
        if (response.ok) {
          return response.text()
            .then(rawString => {
              if (rawString.startsWith('<!DOCTYPE html>')) {
                this.setState({ error: true });
              } else {
                this.setState({
                  loadedEvents: rawString
                });
              }
            });
        }
      })
      .catch((e) => {
        console.error(e)
      });
  }

  loadCommandContext = () => {
    return fetch(`/cli-api/command-context`)
      .then(response => {
        if (response.ok) {
          return response.json()
        }
        throw new Error()
      })
      .then(body => {
        this.setState({
          clientId: body.userId || 'anonymous'
        })
      })
      .catch((e) => {
        console.error(e)
      })
  }

  render() {
    const { loadedEvents, error, clientId, clientSessionId } = this.state;

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
      return <Loading />;
    }
    return (
      <CommandContextStore clientSessionId={clientSessionId} clientId={clientId}>
        <InitialRfcCommandsStore initialEventsString={loadedEvents} rfcId="testRfcId">
          <Switch>
            <Route path={routerPaths.localDiff()} component={LocalDiff} />
            <Route render={() => (
              <LocalRfcStore>
                <TutorialStore>
                  <APIEditorRoutes {...this.props} />
                </TutorialStore>
              </LocalRfcStore>
            )} />
          </Switch>
        </InitialRfcCommandsStore>
      </CommandContextStore>
    );
  }
}


export class LocalDiff extends React.Component {
  render() {
    const { sessionId } = this.props.match.params;
    return (
      <LocalDiffRfcStore>
        <TrafficAndDiffSessionStore sessionId={sessionId} specService={specService}>
          <ShapeDialogStore>
            <LocalDiffManager />
          </ShapeDialogStore>
        </TrafficAndDiffSessionStore>
      </LocalDiffRfcStore>
    );
  }
}

class NewApiLoader extends React.Component {
  render() {
    return (
      <ImportedOASContext.Consumer>
        {({ providedCommands }) => (
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

function PathRoot({ match, baseUrl }) {
  const { pathId } = match.params;
  return (
    <PathContext.Provider value={pathId}>
      <PathPage pathId={pathId} baseUrl={baseUrl} />
    </PathContext.Provider>
  );
}

export class APIEditorRoutes extends React.Component {
  render() {

    const { url } = this.props.match;

    const baseUrl = url;

    return (
      <div>
        <EditorStore baseUrl={baseUrl}>
          <FocusedRequestStore>
            <Switch>
              <Route exact path={routerPaths.newRoot(url)} component={OverView} />
              <Route path={routerPaths.pathPage(url)} component={PathRoot} />
              <Route path={routerPaths.conceptPage(url)}
                component={(props) =>
                  <ConceptsPage {...props} conceptId={props.match.params.conceptId} />
                } />
              <Route path={routerPaths.apiRoot(url)} component={OverView} />
              <Redirect to={routerPaths.apiRoot(url)} />
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
              <Route path={routerPaths.localRoot()} component={LocalLoader} />
              <Redirect to={routerPaths.localRoot()} />
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
            <Route path={routerPaths.newRoot()} component={NewApiLoader} />
            <Route path={'/upload-oas'} exact component={UploadOAS} />
            <Route strict path={routerPaths.exampleCommands()} component={ExampleCommandsLoader} />
            <Route strict path={routerPaths.exampleSessions()} component={ExampleSessionsLoader} />
            <Route path={'/'} exact component={Welcome} />
            <Redirect from={routerPaths.exampleCommands()} to={routerPaths.exampleCommands()} />
            <Redirect from={routerPaths.exampleSessions()} to={routerPaths.exampleSessions()} />
            <Redirect to={routerPaths.newRoot()} />
          </Switch>
        </ImportedOASStore>
      </div>
    );

  }
}

export default AppRoutes;
