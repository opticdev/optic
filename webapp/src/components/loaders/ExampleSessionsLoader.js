import React from 'react';
import { InitialRfcCommandsStore } from '../../contexts/InitialRfcCommandsContext';
import { TrafficAndDiffSessionStore } from '../../contexts/TrafficAndDiffSessionContext';
import { LocalDiffRfcStore } from '../../contexts/RfcContext';
import LocalDiffManager from '../diff/LocalDiffManager';
import Loading from '../navigation/Loading';
import { Route, Switch, Link } from 'react-router-dom';
import { DiffStateStatus } from '../diff-v2/BaseDiffSessionManager';
import { TutorialStore } from '../../contexts/TutorialContext';

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

    const specService = {
      loadSession: (sessionId) => {
        return Promise.resolve({
          diffStateResponse: {
            diffState: {
              status: DiffStateStatus.started,
              interactionResults: {},
              acceptedInterpretations: [],
            }
          },
          sessionResponse: {
            session: this.state.session
          }
        })
      },
      saveEvents: () => { },
      saveDiffState: () => { }
    }

    return (
      <InitialRfcCommandsStore initialEventsString={this.state.events} rfcId="testRfcId">
        <LocalDiffRfcStore>
            <TutorialStore>
              <TrafficAndDiffSessionStore sessionId={'fakeSessionId'} specService={specService}>
                <LocalDiffManager diffPersistedComponent={<After />} />
              </TrafficAndDiffSessionStore>
            </TutorialStore>
        </LocalDiffRfcStore>
      </InitialRfcCommandsStore>
    )
  }
}

function Before(props) {
  const { match } = props;

  return (
    <div>
      <Link to={match.url + '/diff'}>start diff</Link>
    </div>
  )
}

function After(props) {
  const { match } = props;

  return (
    <div>done!</div>
  )
}

class ExampleSessionsLoaderRoutes extends React.Component {
  render() {
    return (
      <Switch>
        <Route exact path="/example-sessions/:exampleId" component={Before} />
        <Route path="/example-sessions/:exampleId/diff" component={ExampleSessionsLoader} />
      </Switch>
    )
  }
}

export default ExampleSessionsLoaderRoutes