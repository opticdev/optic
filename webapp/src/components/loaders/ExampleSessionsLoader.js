import React from 'react';
import { InitialRfcCommandsStore } from '../../contexts/InitialRfcCommandsContext';
import { SessionStore, LocalDiffSessionManager } from '../../contexts/SessionContext';
import { LocalDiffRfcStore } from '../../contexts/RfcContext';
import LocalDiffManager from '../diff/LocalDiffManager';
import { ShapeDialogStore } from '../../contexts/ShapeDialogContext';
import Loading from '../navigation/Loading';
import { Route, Switch, Link } from 'react-router-dom';

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
        const loadSession = (sessionId) => {
            return Promise.resolve({
                diffStateResponse: {
                    diffState: {
                        status: 'started',
                        interactionResults: {},
                        acceptedInterpretations: [],
                    }
                },
                sessionResponse: {
                    session: this.state.session
                }
            })
        }
        
        return (
            <InitialRfcCommandsStore initialEventsString={this.state.events} rfcId="testRfcId">
                <LocalDiffRfcStore>
                    <SessionStore
                        sessionId={'fakeSessionId'}
                        loadSession={loadSession}
                        diffSessionManagerFactory={(...args) => new LocalDiffSessionManager(...args)}
                    >
                        <ShapeDialogStore>
                            <LocalDiffManager diffPersistedComponent={<After />} />
                        </ShapeDialogStore>
                    </SessionStore>
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