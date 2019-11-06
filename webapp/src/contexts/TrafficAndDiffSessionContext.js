import React from 'react';
import { GenericContextFactory } from './GenericContextFactory.js';
import { withRfcContext } from './RfcContext.js';
import LoadingDiff from '../components/diff/LoadingDiff';
import { BaseDiffSessionManager } from '../components/diff-v2/BaseDiffSessionManager.js';

const {
    Context: TrafficAndDiffSessionContext,
    withContext: withTrafficAndDiffSessionContext
} = GenericContextFactory(null)


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

class TrafficAndDiffSessionStoreBase extends React.Component {
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
        const { specService } = this.props;
        specService.loadSession(sessionId)
            .then(result => {
                const diffSessionManager = new BaseDiffSessionManager(
                    sessionId,
                    result.sessionResponse.session,
                    result.diffStateResponse.diffState,
                    this.props.specService
                )
                diffSessionManager.events.on('updated', () => this.forceUpdate())

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
        const { queries, cachedQueryResults } = this.props
        const { isLoading, error, diffSessionManager } = this.state;

        if (isLoading) {
            return <LoadingDiff />
        }

        if (error) {
            console.error(error)
            return <div>something went wrong :(</div>
        }

        const diffStateProjections = computeDiffStateProjections(queries, cachedQueryResults, diffSessionManager)

        const sessionContext = {
            sessionId,
            diffSessionManager,
            diffStateProjections
        }

        return (
            <TrafficAndDiffSessionContext.Provider value={sessionContext}>
                {this.props.children}
            </TrafficAndDiffSessionContext.Provider>
        )
    }
}

const TrafficAndDiffSessionStore = withRfcContext(TrafficAndDiffSessionStoreBase)

export {
    TrafficAndDiffSessionContext,
    TrafficAndDiffSessionStore,
    withTrafficAndDiffSessionContext
}
