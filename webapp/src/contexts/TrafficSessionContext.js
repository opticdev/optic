import React from 'react';
import { GenericContextFactory } from './GenericContextFactory.js';
import { withRfcContext } from './RfcContext.js';
import compose from 'lodash.compose';
import { BaseDiffSessionManager } from '../components/diff/BaseDiffSessionManager.js';
import LoadingDiff from '../components/diff/LoadingDiff.js';

export function computeDiffStateProjections(queries, cachedQueryResults, diffSessionManager) {
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
            const requestId = ((pathId) => {
                if (!pathId) {
                    return null;
                }
                const { requests, requestIdsByPathId } = cachedQueryResults;
                const requestIds = requestIdsByPathId[pathId] || []
                const requestId = requestIds.find(requestId => {
                    const request = requests[requestId]
                    return request.requestDescriptor.httpMethod === item.sample.request.method
                })
                return requestId || null;
            })(pathId);
            return { ...item, pathId, requestId }
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
}

const {
    Context: TrafficSessionContext,
    withContext: withTrafficSessionContext
} = GenericContextFactory(null)

class TrafficSessionStoreBase extends React.Component {
    state = {
        isLoading: true,
        session: null,
        error: null
    }
    componentDidMount() {
        this.setState({
            isLoading: true,
            error: null,
            session: null,
            diffSessionManager: null,
        })
        const { specService, sessionId } = this.props;
        specService
            .loadSession(sessionId)
            .then(result => {
                const { session } = result.sessionResponse
                const diffSessionManager = new BaseDiffSessionManager(
                    sessionId,
                    session,
                    this.props.specService
                )
                diffSessionManager.events.on('updated', () => this.forceUpdate())

                this.setState({
                    session,
                    isLoading: false,
                    error: null,
                    diffSessionManager
                })
                this.checkForUpdates()
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
    checkForUpdates() {
        setTimeout(async () => {
            const { specService, sessionId } = this.props;
            try {

                const result = await specService.loadSession(sessionId)
                const { session, diffSessionManager } = this.state
                const { session: latestSession } = result.sessionResponse
                if (!session){
                    this.checkForUpdates()
    
                    return;
                }
                if (latestSession.samples.length > session.samples.length) {
                    //@TODO: immutablize
                    diffSessionManager.session = latestSession
                    this.setState({
                        session: latestSession,
                        diffSessionManager: diffSessionManager
                    })
                }
                //@TODO: add flag prop to disable checking for updates?
                this.checkForUpdates()
            } catch (e) {
                console.error(e);
                this.checkForUpdates()
            }
        }, 1000)
    }
    render() {
        const { sessionId, children } = this.props;
        const { queries, cachedQueryResults } = this.props
        const { isLoading, error, diffSessionManager, session } = this.state;

        if (isLoading) {
            return <LoadingDiff />
        }

        if (error) {
            console.error(error)
            return <div>something went wrong :(</div>
        }
        const diffStateProjections = computeDiffStateProjections(queries, cachedQueryResults, diffSessionManager)

        const context = {
            sessionId,
            session,
            diffSessionManager,
            diffStateProjections
        }
        return (
            <TrafficSessionContext.Provider value={context}>
                {children}
            </TrafficSessionContext.Provider>
        )
    }
}

const TrafficSessionStore = compose(withRfcContext)(TrafficSessionStoreBase)

export {
    TrafficSessionStore,
    TrafficSessionContext,
    withTrafficSessionContext
} 