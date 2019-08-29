import React from 'react';
import { GenericContextFactory } from './GenericContextFactory.js';
import { RfcContext, saveEvents, withRfcContext } from './RfcContext.js';
import { commandsToJs, commandsFromJson, JsonHelper, commandToJs } from '../engine/index.js';

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

    acceptCommands(commandArray) {
        this.diffState.acceptedInterpretations = this.diffState.acceptedInterpretations || [];
        this.diffState.acceptedInterpretations.push(commandArray.map(x => commandToJs(x)))
        this._persistChanges()
    }

    applyAllChanges(eventStore, rfcId) {
        // persist events to event stream, as opposed to persisting diff state
        return saveEvents(eventStore, rfcId)
    }

    restoreState(handleCommands) {
        (this.diffState.acceptedInterpretations || []).forEach((jsonCommands) => {
            const commandSequence = commandsFromJson(jsonCommands);
            const commandArray = JsonHelper.seqToJsArray(commandSequence)
            handleCommands(...commandArray)
        })
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

class SessionStoreBase extends React.Component {
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
                const diffSessionManager = new DiffSessionManager(sessionId, sessionResponse.session, diffStateResponse.diffState)
                diffSessionManager.restoreState(this.props.handleCommands)
                this.setState({
                    isLoading: false,
                    error: null,
                    session: sessionResponse.session,
                    diffSessionManager
                })
            })
            .catch((e) => {
                console.error(e)
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
            console.error(error)
            return <div>something went wrong :(</div>
        }
        const { queries } = this.props
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
        const handleCommands = (...commands) => {
            this.props.handleCommands(...commands)
            diffSessionManager.acceptCommands(commands)
        }
        const rfcContext = {
            ...this.props,
            handleCommands,
            handleCommand: handleCommands
        }
        const sessionContext = {
            rfcContext,
            sessionId,
            diffSessionManager,
            diffStateProjections,
        }
        return (
            <SessionContext.Provider value={sessionContext}>
                <RfcContext.Provider value={rfcContext}>
                    {this.props.children}
                </RfcContext.Provider>
            </SessionContext.Provider>
        )
    }
}

const SessionStore = withRfcContext(SessionStoreBase)

export {
    SessionContext,
    SessionStore,
    withSessionContext
}