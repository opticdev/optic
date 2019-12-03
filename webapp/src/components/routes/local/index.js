import React from 'react';
import { Switch, Route } from 'react-router-dom';
import uuidv4 from 'uuid/v4';

import { UrlsX } from '../../paths/NewUnmatchedUrlWizard';
import RequestDiffX from '../../diff/RequestDiffX';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import { specService } from '../../../services/SpecService.js';
import Loading from '../../../components/navigation/Loading';
import { InitialRfcCommandsStore } from '../../../contexts/InitialRfcCommandsContext.js';
import { LocalDiffRfcStore } from '../../../contexts/RfcContext.js';
import { TrafficSessionStore } from '../../../contexts/TrafficSessionContext';
import { CommandContextStore } from '../../../contexts/CommandContext.js';
import { routerPaths, basePaths } from '../../../RouterPaths';
import Overview from '../../onboarding/Overview.js';
import { NavigationStore } from '../../../contexts/NavigationContext.js';
import NewBehavior from '../../navigation/NewBehavior.js';
import { RequestsDetailsPage } from '../../requests/EndpointPage';
import { DialogWrapper } from '../../loaders/ExampleDrivenSpecLoader';

export const basePath = basePaths.localBasePath

export class LocalLoader extends React.Component {

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
    return specService.listEvents()
      .then(events => {
        this.setState({
          loadedEvents: events
        })
      })
      .catch((e) => {
        console.error(e)
        this.setState({ error: true });
      });
  }

  loadCommandContext = () => {
    return specService.getCommandContext()
      .then(body => {
        this.setState({
          clientId: body.userId || 'anonymous'
        })
      })
      .catch((e) => {
        // no need to indicate error to user
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

    function SessionWrapper(props) {
      const { match } = props;
      const { sessionId } = match.params;
      return (
        <TrafficSessionStore sessionId={sessionId} specService={specService}>
          <Switch>
            <Route exact path={routerPaths.diffUrls(diffBasePath)} component={UrlsX} />
            <Route exact path={routerPaths.diffRequest(diffBasePath)} component={RequestDiffX} />
          </Switch>
        </TrafficSessionStore>
      )
    }

    const diffBasePath = routerPaths.diff(basePath)
    return (
      <CommandContextStore clientSessionId={clientSessionId} clientId={clientId}>
        <InitialRfcCommandsStore initialEventsString={loadedEvents} rfcId="testRfcId">
          <LocalDiffRfcStore specService={specService}>
            <Switch>
              <Route path={routerPaths.request(basePath)} component={RequestsDetailsPage} />
              <Route exact path={basePath} component={LocalSpecOverview} />
              <Route path={diffBasePath} component={SessionWrapper} />
            </Switch>
          </LocalDiffRfcStore>
        </InitialRfcCommandsStore>
      </CommandContextStore>
    );
  }
}

class LocalSpecOverview extends React.Component {

  state = {
    isEmpty: false,
    sessionId: null,
    samples: []
  }

  componentDidMount() {
    Promise.all([
      specService.listSessions()
        .then(({ sessions }) => sessions.length === 0),
      specService.listEvents()
        .then(events => {
          const numberOfEvents = JSON.parse(events).length
          return numberOfEvents <= 2
        })
    ])
      .then(result => {
        this.setState({
          isEmpty: result.every(i => i)
        })
      })
      .catch((e) => {
        console.error(e)
      });
  }

  handleSampleAdded = async (sample) => {
    if (this.state.samples.length === 0) {
      const samples = [sample]
      const sessionId = new Date().toISOString().replace(/:/g, '_')
      await specService.saveSession(sessionId, { samples })
      this.setState({ sessionId, samples })
    } else {
      const { sessionId, samples } = this.state;
      await specService.saveSession(sessionId, { samples })

      this.setState({
        samples: [...this.state.samples, sample]
      })
    }
  }

  render() {
    const key = `${this.state.sessionId}-${this.state.samples.length}`
    return (
      <SpecOverview
        key={key}
        specService={specService}
        notificationAreaComponent={(
          <DialogWrapper
            specService={specService}
            onSampleAdded={this.handleSampleAdded}>
            <NewBehavior specService={specService} isEmpty={this.state.isEmpty} />
          </DialogWrapper>
        )} />
    );
  }
}

export function SpecOverview(props) {
  const { specService, notificationAreaComponent } = props;
  return (
    <Overview specService={specService} notificationAreaComponent={notificationAreaComponent} />
  )
}

class LocalLoaderRoutes extends React.Component {
  render() {
    const { match } = this.props
    return (
      <NavigationStore baseUrl={match.url}>
        <Switch>
          <Route path={basePath} component={LocalLoader} />
        </Switch>
      </NavigationStore>
    )
  }
}
export default LocalLoaderRoutes
