import React from 'react';
import { GenericContextFactory } from './GenericContextFactory.js';
import { RfcContext } from './RfcContext.js';

const {
    Context: SessionContext,
    withContext: withSessionContext
} = GenericContextFactory(null)

class DiffSessionManager {
    constructor(sessionId, session, diffState) {
        this.sessionId = sessionId;
        this.session = session;
        this.diffState = diffState;
        //@TODO: one-at-a-time bottleneck for this._persistChanges()
    }

    currentInteraction() {
        const { currentInteractionIndex } = this.diffState
        const interaction = this.session.samples[currentInteractionIndex];
        return interaction || null
    }

    skipInteraction() {
        const { currentInteractionIndex } = this.diffState
        const currentInteraction = this.diffState.interactionResults[currentInteractionIndex] || {}

        this.diffState.interactionResults[currentInteractionIndex] = Object.assign(
            currentInteraction,
            { status: 'skipped' }
        )
        this._incrementInteractionCursor()
        this._persistChanges()
    }

    finishInteraction() {
        const { currentInteractionIndex } = this.diffState
        const currentInteraction = this.diffState.interactionResults[currentInteractionIndex] || {}

        this.diffState.interactionResults[currentInteractionIndex] = Object.assign(
            currentInteraction,
            { status: 'completed' },
        )
        this._incrementInteractionCursor()
        this._persistChanges()
    }

    _incrementInteractionCursor() {
        this.diffState.currentInteractionIndex++
    }

    acceptInterpretation(interpretation) {

        const { currentInteractionIndex } = this.diffState
        const currentInteraction = this.diffState.interactionResults[currentInteractionIndex] || {}

        this.diffState.interactionResults[currentInteractionIndex] = Object.assign(
            currentInteraction,
            { acceptedInterpretations: [...(currentInteraction.acceptedInterpretations || []), interpretation] },
        )
        this._persistChanges()
    }

    applyAllChanges() {
        // persist events to event stream, as opposed to persisting diff state
    }

    _persistChanges = async () => {
        fetch(`/cli-api/sessions/${this.sessionId}/diff`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(this.diffState)
        })
    }
}

class SessionStore extends React.Component {
    state = {
        isLoading: true,
        error: null,
        session: null,
        diffSessionManager: null,
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
            diffSessionManager: null,
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
                    diffSessionManager: new DiffSessionManager(sessionId, sessionResponse.session, diffStateResponse.diffState)
                })
            })
            .catch((e) => {
                this.setState({
                    isLoading: false,
                    error: e,
                    session: null,
                    diffSessionManager: null
                })
            })
    }

    render() {
        const { sessionId } = this.props;
        const { isLoading, error, diffSessionManager } = this.state;
        if (isLoading) {
            return null
        }
        if (error) {
            return <div>something went wrong :(</div>
        }
        return (
            <RfcContext.Consumer>
                {(rfcContext) => {
                    const { queries } = rfcContext
                    const diffStateProjections = (function (diffSessionManager) {
                        const { session } = diffSessionManager
                        const urls = new Set(session.samples.map(x => x.request.url))
                        const samplesAndResolvedPaths = session.samples
                            .map((sample, index) => {
                                const pathId = queries.resolvePath(sample.request.url)
                                return { pathId, sample, index }
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
                    })(diffSessionManager)

                    const sessionContext = {
                        rfcContext,
                        sessionId,
                        diffSessionManager,
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