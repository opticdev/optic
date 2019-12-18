import {NetworkUtilities, specService, SpecService} from '../../../services/SpecService';
import React from 'react';
import uuidv4 from 'uuid/v4';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Loading from '../../navigation/Loading';
import {TrafficSessionStore} from '../../../contexts/TrafficSessionContext';
import {Route, Switch} from 'react-router-dom';
import {basePaths, routerPaths} from '../../../RouterPaths';
import {UrlsX} from '../../paths/NewUnmatchedUrlWizard';
import RequestDiffX from '../../diff/RequestDiffX';
import {CommandContextStore} from '../../../contexts/CommandContext';
import {InitialRfcCommandsStore} from '../../../contexts/InitialRfcCommandsContext';
import {LocalRfcStore} from '../../../contexts/RfcContext';
import {RequestsDetailsPage} from '../../requests/EndpointPage';
import {LocalSpecOverview} from './index';
import {NavigationStore} from '../../../contexts/NavigationContext';

export class IntegrationsLoader extends React.Component {

  state = {
    loadedEvents: null,
    error: null,
    clientId: 'anonymous',
    clientSessionId: uuidv4()
  };

  componentDidMount() {
    this.setState({specService: new IntegrationsSpecService(this.props.name)}, () => {
      this.loadCommandContext()
        .then(() => this.loadEvents());
    });
  }

  loadEvents = () => {
    return this.state.specService.listEvents()
      .then(events => {
        this.setState({
          loadedEvents: events
        });
      })
      .catch((e) => {
        console.error(e);
        this.setState({error: true});
      });
  };

  loadCommandContext = () => {
    return this.state.specService.getCommandContext()
      .then(body => {
        this.setState({
          clientId: body.userId || 'anonymous'
        });
      })
      .catch((e) => {
        // no need to indicate error to user
        console.error(e);
      });
  };


  render() {
    const {loadedEvents, error, clientId, clientSessionId} = this.state;
    const {match} = this.props;
    const basePath = basePaths.localIntegrationsPath;

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

    const {specService} = this.state;

    const diffBasePath = routerPaths.diff(basePaths.localIntegrationsPath);

    function SessionWrapper(props) {
      const {match} = props;
      const {sessionId} = match.params;
      return (
        <TrafficSessionStore sessionId={sessionId} specService={specService}>
            <Switch>
              <Route exact path={routerPaths.diffUrls(diffBasePath)} component={UrlsX}/>
              <Route exact path={routerPaths.diffRequest(diffBasePath)} component={RequestDiffX}/>
            </Switch>
        </TrafficSessionStore>
      );
    }

    return (
      <CommandContextStore clientSessionId={clientSessionId} clientId={clientId}>
        <NavigationStore baseUrl={match.url}>
          <InitialRfcCommandsStore initialEventsString={loadedEvents} rfcId="testRfcId">
            <LocalRfcStore specService={this.state.specService}>
              <Switch>
                <Route path={routerPaths.request(basePath)} component={RequestsDetailsPage}/>
                <Route exact path={basePath} component={LocalSpecOverview}/>
                <Route path={diffBasePath} component={SessionWrapper}/>
              </Switch>
            </LocalRfcStore>
          </InitialRfcCommandsStore>
        </NavigationStore>
      </CommandContextStore>
    );
  }


}


class IntegrationsSpecService extends SpecService {
  constructor(name) {
    super();
    this.name = name;
    this.encodedName = encodeURIComponent(name);
  }

  listEvents() {
    return NetworkUtilities.getJsonAsText(`/cli-api/integrations/${this.encodedName}/events`);
  }

  saveEvents(eventStore, rfcId) {
    const serializedEvents = eventStore.serializeEvents(rfcId);
    return NetworkUtilities.putJson(`/cli-api/integrations/${this.encodedName}/events`, serializedEvents);
  }

  saveExample(interaction, requestId) {
    return NetworkUtilities.postJson(`/cli-api/integrations/${this.encodedName}/example-requests/${requestId}`, JSON.stringify(interaction));
  }

  listExamples(requestId) {
    return NetworkUtilities.getJson(`/cli-api/integrations/${this.encodedName}/example-requests/${requestId}`);
  }

  saveDiffState(sessionId, diffState) {
    return NetworkUtilities.putJson(`/cli-api/sessions/${sessionId}/diff`, JSON.stringify(diffState));
  }

  saveSession(sessionId, session) {
    return NetworkUtilities.putJson(`/cli-api/sessions/${sessionId}`, JSON.stringify(session));
  }

  loadSession(sessionId) {
    const promises = [
      NetworkUtilities.getJson(`/cli-api/sessions/${sessionId}`)
    ];
    return Promise.all(promises)
      .then(([sessionResponse]) => {
        if (sessionResponse.session) {
          sessionResponse.session.samples = (sessionResponse.session.integrationSamples || []).filter(i => i.integrationName === this.name);
        }
        return {
          sessionResponse,
          diffStateResponse: null
        };
      });
  }
}
