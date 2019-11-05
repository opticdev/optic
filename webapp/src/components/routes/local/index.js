import React from 'react';
import { Redirect, Switch, Route, Link } from 'react-router-dom';
import uuidv4 from 'uuid/v4';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import { specService } from '../../../services/SpecService.js';
import Loading from '../../../components/navigation/Loading';
import LocalDiffManager from '../../../components/diff/LocalDiffManager';
import { InitialRfcCommandsStore } from '../../../contexts/InitialRfcCommandsContext.js';
import { LocalRfcStore, LocalDiffRfcStore } from '../../../contexts/RfcContext.js';
import { TutorialStore } from '../../../contexts/TutorialContext';
import { TrafficAndDiffSessionStore } from '../../../contexts/TrafficAndDiffSessionContext';
import { CommandContextStore } from '../../../contexts/CommandContext.js';
import { routerPaths } from '../../../routes.js';
import Overview from '../../onboarding/Overview.js';
import { NavigationStore, withNavigationContext } from '../../../contexts/NavigationContext.js';

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
    return fetch(`/cli-api/events`, { headers: { 'accept': 'application/json' } })
      .then(response => {
        if (response.ok) {
          return response.text()
            .then(rawString => {
              this.setState({
                loadedEvents: rawString
              });
            });
        }
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
    const { match } = this.props;

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
      <NavigationStore baseUrl={match.url}>
        <CommandContextStore clientSessionId={clientSessionId} clientId={clientId}>
          <InitialRfcCommandsStore initialEventsString={loadedEvents} rfcId="testRfcId">
            <Switch>
              <Route path={routerPaths.diff(match.url)} component={LocalDiff} />
              <Route path={match.url} component={LocalSpec} />
            </Switch>
          </InitialRfcCommandsStore>
        </CommandContextStore>
      </NavigationStore>
    );
  }
}

export function RequestViewer(props) {
  const { match } = props;
  const { requestId } = match.params;
  return (
    <div>request {requestId}</div>
  );
}

export class LocalSpecOverview extends React.Component {
  render() {
    return (
      <SpecOverview specService={specService} />
    );
  }
}
export class SpecOverview extends React.Component {
  state = {
    isLoading: true,
    lastSessionId: null,
    error: null
  }
  componentDidMount() {
    this.props.specService.listSessions()
      .then(listSessionsResponse => {
        debugger
        const { sessions } = listSessionsResponse
        if (sessions.length > 0) {
          const [lastSessionId] = sessions;
          //@TODO check diff state to make sure it's not persisted already
          this.setState({
            isLoading: false,
            lastSessionId
          })
        } else {
          this.setState({
            isLoading: false
          })
        }
      })
      .catch(e => {
        this.setState({
          isLoading: false,
          error: true
        })
      })
  }
  render() {
    const { lastSessionId, isLoading, error } = this.state;
    if (error) {
      return (<div>something went wrong :(</div>)
    }

    if (isLoading) {
      return <Loading />
    }
    return (
      <div>
        {lastSessionId ? <div>show diff state for {lastSessionId}</div> : null}
        <Overview />
      </div>
    );
  }
}
class LocalSpecBase extends React.Component {
  render() {
    const { baseUrl } = this.props;
    return (
      <LocalRfcStore>
        <TutorialStore>
          <Switch>
            <Route exact path={routerPaths.request(baseUrl)} component={RequestViewer} />
            <Route exact path={baseUrl} component={LocalSpecOverview} />
            <Redirect to={baseUrl} />
          </Switch>
        </TutorialStore>
      </LocalRfcStore>
    )
  }
}
export const LocalSpec = withNavigationContext(LocalSpecBase)

export class LocalDiff extends React.Component {
  render() {
    const { match } = this.props;
    const { sessionId } = match.params;
    const baseUrl = match.url;
    return (
      <NavigationStore baseUrl={baseUrl}>
        <LocalDiffRfcStore>
          <TutorialStore>
            <TrafficAndDiffSessionStore sessionId={sessionId} specService={specService}>
              <LocalDiffManager />
            </TrafficAndDiffSessionStore>
          </TutorialStore>
        </LocalDiffRfcStore>
      </NavigationStore>
    );
  }
}