import React from 'react';
import { GenericContextFactory } from './GenericContextFactory.js';
import { RfcContext, saveEvents, withRfcContext } from './RfcContext.js';
import { commandsFromJson, JsonHelper, commandToJs } from '../engine/index.js';
import { EventEmitter } from 'events';
import debounce from 'lodash.debounce';
import LoadingDiff from '../components/diff/LoadingDiff';

const {
    Context: SessionContext,
    withContext: withSessionContext
} = GenericContextFactory(null)

export const DiffStateStatus = {
    persisted: 'persisted',
    started: 'started',
}

class DiffSessionManager {
    constructor(sessionId, session, diffState) {
        this.sessionId = sessionId;
        this.session = session;
        this.diffState = diffState;
        this.events = new EventEmitter()
        this.events.on('change', debounce(() => this.events.emit('updated'), 10, { leading: true, trailing: true, maxWait: 100 }))
        this.events.on('updated', () => this.persistState())
    }

    markAsManuallyIntervened(currentInteractionIndex) {
        this.diffState.status = DiffStateStatus.started;
        const currentInteraction = this.diffState.interactionResults[currentInteractionIndex] || {}
        this.diffState.interactionResults[currentInteractionIndex] = Object.assign(
            currentInteraction,
            { status: 'manual' }
        )
        this.events.emit('change')
    }

    skipInteraction(currentInteractionIndex) {
        this.diffState.status = DiffStateStatus.started;
        const currentInteraction = this.diffState.interactionResults[currentInteractionIndex] || {}

        this.diffState.interactionResults[currentInteractionIndex] = Object.assign(
            currentInteraction,
            { status: 'skipped' }
        )
        this.events.emit('change')
    }

    markDiffAsIgnored(diffString) {
        this.diffState.ignoredDiffs = this.diffState.ignoredDiffs || {};
        this.diffState.ignoredDiffs[diffString] = true
        this.events.emit('change')
    }

    finishInteraction(currentInteractionIndex) {
        this.diffState.status = DiffStateStatus.started;
        const currentInteraction = this.diffState.interactionResults[currentInteractionIndex] || {}

        this.diffState.interactionResults[currentInteractionIndex] = Object.assign(
            currentInteraction,
            { status: 'completed' },
        )
        this.events.emit('change')
    }

    acceptCommands(commandArray) {
        this.diffState.status = DiffStateStatus.started;
        this.diffState.acceptedInterpretations.push(commandArray.map(x => commandToJs(x)))
        this.events.emit('change')
    }

    async applyDiffToSpec(eventStore, rfcId) {
        await this.persistState()
        // console.log('begin transaction')
        await saveEvents(eventStore, rfcId, this.diffState.baseSpecVersion)
        this.diffState.status = DiffStateStatus.persisted;
        await this.persistState()
        // console.log('end transaction')
        this.events.emit('updated')
    }

    restoreState(handleCommands) {
        if (this.diffState.status === 'started') {
            const allCommands = this.diffState.acceptedInterpretations.reduce((acc, value) => [...acc, ...value], [])
            // console.log({ allCommands })
            const commandSequence = commandsFromJson(allCommands)
            const commandArray = JsonHelper.seqToJsArray(commandSequence)
            handleCommands(...commandArray)
            // console.log('done restoring')
        }
    }

    persistState() {
        console.count('persisting')
        return fetch(`/cli-api/sessions/${this.sessionId}/diff`, {
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
                diffSessionManager.events.on('updated', () => this.forceUpdate())
                diffSessionManager.restoreState(this.props.handleCommands)
                this.setState({
                    isLoading: false,
                    error: null,
                    diffSessionManager
                })
            })
            .catch((e) => {
                console.error(e)
                this.setState({
                    isLoading: false,
                    error: e,
                    diffSessionManager: null
                })
            })
    }

    render() {
        const { sessionId } = this.props;
        const { isLoading, error, diffSessionManager } = this.state;
        if (isLoading) {
            return <LoadingDiff />
        }
        if (error) {
            console.error(error)
            return <div>something went wrong :(</div>
        }
        const { queries } = this.props
        const diffStateProjections = (function (diffSessionManager) {
            const { session } = diffSessionManager
            const sortedSampleItems = session.samples
                .map((sample, index) => {
                    return {
                        sample, index
                    }
                })
                .sort((a, b) => {
                    const urlComparison = a.sample.request.url.localeCompare(b.sample.request.url)
                    if (urlComparison !== 0) {
                        return urlComparison
                    }
                    const verbComparison = a.sample.request.method.localeCompare(b.sample.request.method)
                    return verbComparison
                })
            const urls = new Set(sortedSampleItems.map(x => x.sample.request.url))

            const sampleItemsAndResolvedPaths = sortedSampleItems
                .map((item) => {
                    const pathId = queries.resolvePath(item.sample.request.url)
                    return { ...item, pathId }
                })
            const sampleItemsWithResolvedPaths = sampleItemsAndResolvedPaths.filter(x => !!x.pathId)
            const sampleItemsWithoutResolvedPaths = sampleItemsAndResolvedPaths.filter(x => !x.pathId)

            const sampleItemsGroupedByPath = sampleItemsWithResolvedPaths
                .reduce((acc, value) => {
                    const { pathId } = value;
                    const group = acc[pathId] || []
                    group.push(value)
                    acc[pathId] = group
                    return acc
                }, {})

            return {
                urls,
                sortedSampleItems,
                sampleItemsWithResolvedPaths,
                sampleItemsWithoutResolvedPaths,
                sampleItemsGroupedByPath
            }
        })(diffSessionManager)
        const handleCommands = (...commands) => {
            this.props.handleCommands(...commands)
            diffSessionManager.acceptCommands(commands)
        }
        const applyCommands = (...commands) => {
            this.props.handleCommands(...commands)
            diffSessionManager.acceptCommands(commands)
        }
        const { children, ...rest } = this.props
        const rfcContext = {
            ...rest,
            handleCommands,
            handleCommand: handleCommands
        }
        const sessionContext = {
            rfcContext,
            sessionId,
            diffSessionManager,
            diffStateProjections,
            applyCommands
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
