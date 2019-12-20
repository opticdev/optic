import React from 'react';
import { InitialRfcCommandsStore } from '../../contexts/InitialRfcCommandsContext';
import { TrafficSessionStore } from '../../contexts/TrafficSessionContext';
import { LocalDiffRfcStore } from '../../contexts/RfcContext';
import Loading from '../navigation/Loading';
import { Route, Switch } from 'react-router-dom';
import { UrlsX } from '../paths/NewUnmatchedUrlWizard';
import RequestDiffX from '../diff/RequestDiffX';
import { NavigationStore } from '../../contexts/NavigationContext';
import { routerPaths, basePaths } from '../../RouterPaths';
import { SpecOverview } from '../routes/local';
import NewBehavior from '../navigation/NewBehavior';
import { RequestsDetailsPage } from '../requests/EndpointPage';

export const basePath = basePaths.exampleSessionsBasePath

class ExampleSessionsLoader extends React.Component {

  state = {
    isLoaded: false
  };

  componentDidMount() {
    fetch(`/example-sessions/${this.props.match.params.exampleId}.json`, {
      headers: {
        'accept': 'application/json'
      }
    })
      .then(response => {
        if (response.ok) {
          return response.json()
        }
      })
      .then(body => {
        this.setState({
          isLoaded: true,
          events: JSON.stringify(body.events),
          examples: body.examples || {},
          session: body.session
        })
      })
      .catch(e => {
        console.error(e)
      });
  }

  render() {
    if (!this.state.isLoaded) {
      return <Loading />
    }
    const sessionId = 'live-session';
    const specService = {
      loadSession: (sessionId) => {
        return Promise.resolve({
          diffStateResponse: {
            diffState: {

            }
          },
          sessionResponse: {
            session: this.state.session
          }
        })
      },
      listSessions() {
        return Promise.resolve({ sessions: [sessionId] })
      },
      saveEvents: (eventStore, rfcId) => {
        const events = eventStore.serializeEvents(rfcId)
        this.setState({
          events
        })
      },
      listExamples: (requestId) => {
        return Promise.resolve({examples: this.state.examples[requestId] || []})
      },
      saveExample: (interaction, requestId) => {
        const examples = this.state.examples
        const requestExamples = examples[requestId] || []
        requestExamples.push(interaction)
        examples[requestId] = requestExamples
        this.setState({examples})
      },
      saveDiffState: () => { }
    }

    const diffBasePath = routerPaths.diff(basePath)

    //@todo add before modal here eventually
    function ExampleSessionsSpecOverview() {
      return (
        <SpecOverview
          specService={specService}
          notificationAreaComponent={<NewBehavior specService={specService} />} />
      )
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

    return (
      <InitialRfcCommandsStore initialEventsString={this.state.events} rfcId="testRfcId">
        <LocalDiffRfcStore specService={specService}>
            <Switch>
              <Route path={routerPaths.request(basePath)} component={RequestsDetailsPage} />
              <Route exact path={basePath} component={ExampleSessionsSpecOverview} />
              <Route path={diffBasePath} component={SessionWrapper} />
            </Switch>
        </LocalDiffRfcStore>
      </InitialRfcCommandsStore>
    )
  }
}

class ExampleSessionsLoaderRoutes extends React.Component {
  render() {
    const { match } = this.props
    return (
      <NavigationStore baseUrl={match.url}>
        <Switch>
          <Route path={basePath} component={ExampleSessionsLoader} />
        </Switch>
      </NavigationStore>
    )
  }
}

export default ExampleSessionsLoaderRoutes
