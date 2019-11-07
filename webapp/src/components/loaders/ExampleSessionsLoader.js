import React from 'react';
import { InitialRfcCommandsStore } from '../../contexts/InitialRfcCommandsContext';
import { TrafficAndDiffSessionStore } from '../../contexts/TrafficAndDiffSessionContext';
import { LocalDiffRfcStore } from '../../contexts/RfcContext';
import Loading from '../navigation/Loading';
import { Route, Switch, Link } from 'react-router-dom';
import { TutorialStore } from '../../contexts/TutorialContext';
import { UrlsX } from '../../stories/doc-mode/NewUnmatchedUrlWizard';
import RequestDiffX from '../../stories/doc-mode/RequestDiffX';
import { NavigationStore } from '../../contexts/NavigationContext';
import { routerPaths } from '../../routes';
import { SpecOverview } from '../routes/local';
import NewBehavior from '../../stories/doc-mode/NewBehavior';

export const basePath = `/example-sessions/:exampleId`;

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
    const sessionId = 'fakeSessionId';
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
      saveExample: () => {

      },
      saveDiffState: () => { }
    }

    const diffBasePath = routerPaths.diff(basePath)

    //@todo add before modal here eventually
    function ExampleSessionsSpecOverview() {
      return (
        <SpecOverview notificationAreaComponent={<NewBehavior specService={specService} />} />
      )
    }

    function SessionWrapper(props) {
      const { match } = props;
      const { sessionId } = match.params;
      return (
        <TrafficAndDiffSessionStore sessionId={sessionId} specService={specService}>
          <Switch>
            <Route exact path={routerPaths.diffUrls(diffBasePath)} component={UrlsX} />
            <Route exact path={routerPaths.diffRequest(diffBasePath)} component={RequestDiffX} />
          </Switch>
        </TrafficAndDiffSessionStore>
      )
    }

    return (
      <InitialRfcCommandsStore initialEventsString={this.state.events} rfcId="testRfcId">
        <LocalDiffRfcStore specService={specService}>
          <TutorialStore>
            <Switch>
              <Route exact path={basePath} component={ExampleSessionsSpecOverview} />
              <Route path={diffBasePath} component={SessionWrapper} />
            </Switch>
          </TutorialStore>
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
