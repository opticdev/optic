import React from 'react';
import { InitialRfcCommandsStore } from '../../contexts/InitialRfcCommandsContext';
import { TrafficAndDiffSessionStore } from '../../contexts/TrafficAndDiffSessionContext';
import { LocalDiffRfcStore } from '../../contexts/RfcContext';
import LocalDiffManager from '../diff/LocalDiffManager';
import { ShapeDialogStore } from '../../contexts/ShapeDialogContext';
import Loading from '../navigation/Loading';
import { Route, Switch, Link } from 'react-router-dom';
import { DiffStateStatus } from '../diff-v2/BaseDiffSessionManager';

class ExampleSessionsLoader extends React.Component {

    state = {
        isLoaded: false
    };

    componentDidMount() {
        fetch(`/example-sessions/${this.props.match.params.exampleId}.json`)
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
            saveEvents: () => {},
            saveDiffState: () => {}
        }
        
        return (
            <InitialRfcCommandsStore initialEventsString={this.state.events} rfcId="testRfcId">
                <LocalDiffRfcStore>
                    <TrafficAndDiffSessionStore sessionId={'fakeSessionId'} specService={specService}>
                        <ShapeDialogStore>
                            <LocalDiffManager diffPersistedComponent={<After />} />
                        </ShapeDialogStore>
                    </TrafficAndDiffSessionStore>
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
        <div>
            done!
        </div>
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