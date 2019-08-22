import React from 'react';
import { GenericContextFactory } from './GenericContextFactory.js';
import { RfcContext } from './RfcContext.js';
import { Facade, Queries } from '../engine';

const {
    Context: SessionContext,
    withContext: withSessionContext
} = GenericContextFactory(null)

class DiffSessionManager {
    async getSession(sessionId) {

    }

    getDiff(shapesState, interaction) {

    }
}

class SessionStore extends React.Component {
    state = {
        isLoading: true,
        error: null,
        session: null,
        diffState: null
    }
    componentDidMount() {
        const { sessionId } = this.props
        this.loadSession(sessionId)
    }

    loadSession(sessionId) {
        this.setState({
            isLoading: true,
            error: null,
            session: null,
            diffState: null
        })
        const promises = [
            fetch(`/cli-api/sessions/${sessionId}`)
                .then((response) => {
                    if (response.ok) {
                        return response.json()
                    }
                    return response.text()
                        .then((text) => {
                            throw new Error(text)
                        })
                }),
            fetch(`/cli-api/sessions/${sessionId}/diff`)
                .then((response) => {
                    if (response.ok) {
                        return response.json()
                    }
                    return response.text()
                        .then((text) => {
                            throw new Error(text)
                        })
                })
        ]
        Promise.all(promises)
            .then(([sessionResponse, diffStateResponse]) => {
                this.setState({
                    isLoading: false,
                    error: null,
                    session: sessionResponse.session,
                    diffState: diffStateResponse.diffState
                })
            })
            .catch((e) => {
                this.setState({
                    isLoading: false,
                    error: e,
                    session: null,
                    diffState: null
                })
            })
    }

    saveCommands(...commands) {
        // debounced mutate diffstate, adding commands via PUT
    }

    render() {
        const { sessionId } = this.props;
        const { isLoading, error, session, diffState } = this.state;
        if (isLoading) {
            return null
        }
        if (error) {
            return <div>something went wrong :(</div>
        }
        return (
            <RfcContext.Consumer>
                {(rfcContext) => {
                    const { rfcId } = rfcContext
                    const sessionContext = {
                        sessionId,
                        session,
                        diffState
                    }
                    const eventStore = Facade.makeEventStore();
                    const rfcService = Facade.fromJsonCommands(eventStore, JSON.stringify(diffState.commands), rfcId)

                    const queries = Queries(eventStore, rfcService, this.props.rfcId);
                    const handleCommands = (...commands) => {
                        this.saveCommands(...commands)
                        global.commands.push(...commands)
                        rfcService.handleCommands(this.props.rfcId, ...commands);
                    }
                    const newRfcContext = {
                        ...rfcContext,
                        handleCommands,
                        handleCommand: handleCommands
                    }
                    return (

                        <SessionContext.Provider value={sessionContext}>
                            <RfcContext.Provider value={newRfcContext}>
                                {this.props.children}
                            </RfcContext.Provider>
                        </SessionContext.Provider>
                    )
                }}
            </RfcContext.Consumer>
        )
    }
}

export {
    SessionContext,
    SessionStore,
    withSessionContext
}