import * as React from 'react';
import { commandsToJson, Facade, Queries } from '../engine';
import { GenericContextFactory } from './GenericContextFactory.js';
import { withInitialRfcCommandsContext } from './InitialRfcCommandsContext.js';
import debounce from 'lodash.debounce';
import { withSnackbar } from 'notistack';
import { track } from '../Analytics';

const {
    Context: RfcContext,
    withContext: withRfcContext
} = GenericContextFactory(null);

global.commands = []
global.getCommandsAsJson = function () {
    return commandsToJson(global.commands)
}
export function stuffFromQueries(queries) {
    const apiName = queries.apiName();
    const contributions = queries.contributions()

    const { requests, pathComponents, responses, requestParameters } = queries.requestsState()
    console.log({ pathComponents })
    const pathIdsByRequestId = queries.pathsWithRequests();
    const pathsById = pathComponents;
    // const absolutePaths = Object.keys(pathsById).map(pathId => ({ [pathId]: queries.absolutePath(pathId) })).reduce((acc, value) => Object.assign(acc, value), {})
    // console.log({ absolutePaths })
    const pathIdsWithRequests = new Set(Object.values(pathIdsByRequestId))

    const conceptsById = queries.namedShapes()
    const shapesState = queries.shapesState()

    const requestIdsByPathId = Object
        .entries(pathIdsByRequestId)
        .reduce((acc, entry) => {
            const [requestId, pathId] = entry;
            const value = acc[pathId] || []
            value.push(requestId)
            acc[pathId] = value;
            return acc
        }, {})

    const cachedQueryResults = {
        apiName,
        contributions,
        requests,
        requestParameters,
        responses,
        conceptsById,
        pathIdsByRequestId,
        requestIdsByPathId,
        pathsById,
        pathIdsWithRequests,
        shapesState
    }
    return cachedQueryResults
}
class RfcStoreWithoutContext extends React.Component {
    constructor(props) {
        super(props);

        this.handleCommands = this.handleCommands.bind(this)

        const eventStore = Facade.makeEventStore();
        const rfcService = Facade.fromJsonCommands(eventStore, this.props.initialCommandsString || '[]', this.props.rfcId)

        const queries = Queries(eventStore, rfcService, this.props.rfcId);

        if (this.props.initialEventsString) {
            eventStore.bulkAdd(this.props.rfcId, this.props.initialEventsString)
        }

        this.state = {
            eventStore,
            rfcService,
            queries,
            hasUnsavedChanges: false
        };
    }

    handleCommand = (command) => {
        this.handleCommands(command)
    };

    handleChange = debounce(() => {
        this.forceUpdate()
    }, 10, { leading: true })

    handleCommands(...commands) {
        console.log({ commands })
        global.commands.push(...commands)
        this.state.rfcService.handleCommands(this.props.rfcId, ...commands);
        this.handleChange()

        commands.forEach(command => track('Command', { commandType: commandNameFor(command) }))
    }

    render() {
        const { queries, hasUnsavedChanges, rfcService } = this.state;
        const { rfcId } = this.props;
        const cachedQueryResults = stuffFromQueries(queries)

        const value = {
            rfcId,
            rfcService,
            queries,
            cachedQueryResults,
            handleCommand: this.handleCommand,
            handleCommands: this.handleCommands,
            serializeEvents: this.serializeEvents,
            hasUnsavedChanges
        };

        return (
            <RfcContext.Provider value={value}>
                {this.props.children}
            </RfcContext.Provider>
        );
    }
}

const RfcStore = withInitialRfcCommandsContext(RfcStoreWithoutContext);


class LocalRfcStoreWithoutContext extends RfcStoreWithoutContext {
    
    handleCommands = (...commands) => {
        super.handleCommands(...commands)
        this.setState({ hasUnsavedChanges: true })
        this.persistEvents()
    }

    persistEvents = debounce(async () => {
        const serializedEvents = this.serializeEvents()

        const response = await fetch('/cli-api/events', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: serializedEvents
        });

        if (response.ok) {
            this.props.enqueueSnackbar('Saved', { 'variant': 'success' })
            this.setState({ hasUnsavedChanges: false })
        } else {
            this.props.enqueueSnackbar('Unable to save changes. Make sure the CLI is still running.', { 'variant': 'error' })
        }

    }, 4000, { leading: true, trailing: true })

    serializeEvents = () => {
        return this.state.eventStore.serializeEvents(this.props.rfcId);
    };
}

const LocalRfcStore = withSnackbar(withInitialRfcCommandsContext(LocalRfcStoreWithoutContext))

class LocalDiffRfcStoreWithoutContext extends RfcStoreWithoutContext {
    handleCommands = (...commands) => {
        super.handleCommands(...commands)
    }
}
const LocalDiffRfcStore =withSnackbar(withInitialRfcCommandsContext(LocalDiffRfcStoreWithoutContext))

export {
    RfcStore,
    LocalRfcStore,
    LocalDiffRfcStore,
    RfcContext,
    withRfcContext
};


function commandNameFor(command) {
    const name = command.$classData.name
    const split = name.split('$')
    return split[1]
}
