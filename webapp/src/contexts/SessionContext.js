import React from 'react';
import { GenericContextFactory } from './GenericContextFactory.js';
import { RfcContext } from './RfcContext.js';

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
                    const { handleCommands, rfcId, rfcService, queries, cachedQueryResults } = rfcContext
                    const { requests, pathsById } = cachedQueryResults
                    const diffStateProjections = (function (session, diffState) {
                        const urls = new Set(session.samples.map(x => x.request.url))
                        const samplesAndResolvedPaths = session.samples
                            .map(sample => {
                                const pathId = queries.resolvePath(sample.request.url)
                                return { pathId, sample }
                            })
                        const samplesWithResolvedPaths = samplesAndResolvedPaths.filter(x => !!x.pathId)
                        const samplesWithoutResolvedPaths = samplesAndResolvedPaths.filter(x => !x.pathId)
                        const samplesGroupedByPath = samplesWithResolvedPaths
                            .reduce((acc, value) => {
                                const { pathId, sample } = value;
                                const group = acc[pathId] || []
                                group.push(sample)
                                acc[pathId] = group
                                return acc
                            }, {})
                        // @TODO: calculate progress
                        
                        return {
                            urls,
                            samplesWithResolvedPaths,
                            samplesWithoutResolvedPaths,
                            samplesGroupedByPath
                        }
                    })(session, diffState)
                    


                    const sessionContext = {
                        rfcContext,
                        sessionId,
                        session,
                        diffState,
                        diffStateProjections,
                    }
                    return (
                        <SessionContext.Provider value={sessionContext}>
                            {this.props.children}
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